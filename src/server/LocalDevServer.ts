import path from 'path';
import fs from 'fs';
import { performance } from 'perf_hooks';
import uuidv4 from 'uuidv4';
import Project from '../common/Project';
import WebruntimeConfig from './config/WebruntimeConfig';
import LocalDevTelemetryReporter from '../instrumentation/LocalDevTelemetryReporter';
import {
    sessionNonce,
    apexMiddleware,
    projectMetadata,
    liveReload,
    apiMiddleware,
    resourceUrl
} from './extensions';
import { ContainerAppExtension, ServiceDefinitionCtor } from '@webruntime/api';
import { Server } from '@webruntime/server';
import { getCustomComponentService } from './services/CustomComponentService';
import { copyFiles, findLWCFolderPath } from '../common/fileUtils';
import { getLabelService } from './services/LabelsService';
import { ComponentServiceWithExclusions } from './services/ComponentServiceWithExclusions';
import colors from 'colors';
import { AddressInfo } from 'net';
import { Connection } from '@salesforce/core';
import { CONTENT_ASSETS, STATIC_RESOURCES } from '../common/Constants';
import { copyStaticAssets } from '../common/StaticResourcesUtils';

export default class LocalDevServer {
    private server: Server;
    private config: WebruntimeConfig;
    private rootDir: string;
    private project: Project;
    private liveReload?: any;
    private readonly sessionNonce: string;
    private readonly vendorVersion: string | undefined;

    /**
     * Initializes properties for the LocalDevServer
     *
     * @param project project object
     * @param connection JSForce connection for the org
     */
    constructor(project: Project, connection?: Connection) {
        this.rootDir = path.join(__dirname, '..', '..');
        this.project = project;
        this.sessionNonce = uuidv4();
        this.vendorVersion = project.configuration.core_version;

        const supportedCoreVersions = this.getSupportedCoreVersions();
        if (
            !this.vendorVersion ||
            !supportedCoreVersions.includes(this.vendorVersion)
        ) {
            // fallback to latest supported core version
            this.vendorVersion =
                supportedCoreVersions[supportedCoreVersions.length - 1];
        }

        const config = new WebruntimeConfig(this.project);

        const middleware: ContainerAppExtension[] = [
            sessionNonce(this.sessionNonce),
            resourceUrl()
        ];

        if (connection) {
            middleware.push(
                apexMiddleware({
                    instanceUrl: connection.instanceUrl,
                    accessToken: connection.accessToken
                }),
                apiMiddleware({
                    apiEndpoint: project.configuration.endpoint,
                    apiEndpointHeaders: project.configuration.endpointHeaders,
                    apiVersion: project.configuration.api_version,
                    recordDir: path.join(config.buildDir, 'api')
                })
            );
        }

        config.addMiddleware(middleware);
        const routes: ContainerAppExtension[] = [
            projectMetadata(this.sessionNonce, this.project)
        ];

        if (this.project.configuration.liveReload) {
            this.liveReload = liveReload(
                path.join(config.buildDir, 'metadata.json')
            );
            routes.push(this.liveReload);
        }

        config.addRoutes(routes);

        // We have a separate work item to make local dev server work with the 228 LDS changes, where LDS is refactored into separate modules.
        // Until then, we are adding 226 modules as well for components using LDS to work.
        config.addModules([
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/lightning-stub-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/force-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/connect-gen-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-226/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-226/force-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-226/connect-gen-pkg`
        ]);

        // We don't officially support non-SFDX projects, but this continues to
        // let them work via localdevserver.config.json.
        if (!this.project.isSfdx) {
            config.addModules([this.project.modulesSourceDirectory]);
        }

        const services: ServiceDefinitionCtor[] = [
            // @ts-ignore
            ComponentServiceWithExclusions,
            getLabelService(project.customLabelsPath)
        ];

        if (this.project.isSfdx) {
            const lwcPath = findLWCFolderPath(
                this.project.modulesSourceDirectory
            );

            if (lwcPath) {
                services.push(
                    getCustomComponentService(
                        project.configuration.namespace,
                        path.dirname(lwcPath)
                    )
                );
            } else {
                console.warn(
                    `No 'lwc' directory found in path ${project.modulesSourceDirectory}`
                );
            }
        }

        config.addServices(services);

        this.config = config;
        this.server = new Server({
            config
        });
    }

    async shutdown() {
        if (this.liveReload) {
            await this.liveReload.close();
        }
        await this.server.shutdown();
    }

    /**
     * Starts the server. If the server successfully started and contains
     * an address, print the server up message.
     */
    async start() {
        const startTime = performance.now();
        // Reporter for instrumentation
        const reporter = await LocalDevTelemetryReporter.getInstance(
            this.sessionNonce
        );
        try {
            await this.server.initialize();
            copyStaticAssets(this.project, this.config);
            this.server.on('shutdown', () => {
                // After the application has ended.
                // Report how long the server was opened.
                reporter.trackApplicationEnd(startTime);
            });
            await this.server.start();

            reporter.trackApplicationStart(
                startTime,
                this.vendorVersion || '0'
            );

            let port = `${this.serverPort}`;
            if (port && port !== 'undefined') {
                console.log(
                    colors.magenta.bold(`Server up on http://localhost:${port}`)
                );
            } else {
                console.error(`Server start up failed.`);
            }
        } catch (e) {
            reporter.trackApplicationStartException(e);
            console.error(`Server start up failed.`);
            throw e;
        }
    }

    /**
     * Verify the server is up and contains an address. Return the port from
     * this address. Do not use the configured port, as the server may not be
     * using the same value.
     */
    get serverPort() {
        if (this.server.httpServer && this.server.httpServer.address()) {
            const addressInfo: AddressInfo = this.server.httpServer.address() as AddressInfo;
            return addressInfo.port;
        }
    }

    /**
     * Get supported core versions of vendored modules
     */
    private getSupportedCoreVersions() {
        const vendoredModulesPath = path.join(
            require.resolve('@salesforce/lwc-dev-server-dependencies'),
            '..',
            'vendors'
        );

        const vendoredModules = fs.readdirSync(vendoredModulesPath);

        return vendoredModules.map(module => {
            return module.split('-')[1];
        });
    }
}

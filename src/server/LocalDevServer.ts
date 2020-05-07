import path from 'path';
import fs from 'fs';
import uuidv4 from 'uuidv4';
import Project from '../common/Project';
import WebruntimeConfig from './config/WebruntimeConfig';
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
import { copyFiles } from '../common/fileUtils';
import { getLabelService } from './services/LabelsService';
import { ComponentServiceWithExclusions } from './services/ComponentServiceWithExclusions';
import colors from 'colors';
import { AddressInfo } from 'net';
import { Connection } from '@salesforce/core';

export default class LocalDevServer {
    private server: Server;
    private config: WebruntimeConfig;
    private rootDir: string;
    private project: Project;
    private liveReload?: any;
    private readonly sessionNonce: string;
    private readonly vendorVersion: string | undefined;

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

        config.addModules([
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/force-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/connect-gen-pkg`
        ]);

        if (this.vendorVersion === '224') {
            // The 220-224 versions of LDS make use of aggregate-ui which does
            // not work outside of core. We add this to override the version LDS
            // back to the 218 version.

            // In 224 LDS there's a flag we can use to disable use of
            // aggregate-ui, then we can remove this override: W-7069525.

            // In 226 LDS the use of aggregate-ui is supposed to be removed, so
            // if all orgs are on 226 before W-7069525 is completed then this
            // can be removed and the story nevered.

            // LDS is the only thing in this 218 package so adding this at the
            // end should only override LDS, not any other packages.
            config.addModules([
                `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/force-pkg`
            ]);
        }

        // We don't officially support non-SFDX projects, but this continues to
        // let them work via localdevserver.config.json. We should standardize
        // how modules are resolved-- https://salesforce.quip.com/i1b0AQqkJ46F
        if (!this.project.isSfdx) {
            config.addModules([this.project.modulesSourceDirectory]);
        }

        const services: ServiceDefinitionCtor[] = [
            // @ts-ignore
            ComponentServiceWithExclusions,
            getLabelService(project.customLabelsPath)
        ];

        if (this.project.isSfdx) {
            services.push(
                getCustomComponentService(
                    project.configuration.namespace,
                    path.join(project.modulesSourceDirectory, 'main', 'default')
                )
            );
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
        try {
            await this.server.initialize();
            this.copyStaticAssets();
            await this.server.start();

            let port = `${this.serverPort}`;
            if (port && port !== 'undefined') {
                console.log(
                    colors.magenta.bold(`Server up on http://localhost:${port}`)
                );
            } else {
                console.error(`Server start up failed.`);
            }
        } catch (e) {
            console.error(`Server start up failed.`);
            throw e;
        }
    }

    private copyStaticAssets() {
        // copy app static resources
        const distAssetsPath = path.join(this.rootDir, 'dist', 'assets');
        const serverAssetsPath = path.join(this.config.buildDir, 'assets');

        try {
            const localDevAssetsPath = path.join(serverAssetsPath, 'localdev');
            copyFiles(path.join(distAssetsPath, '*'), localDevAssetsPath);
        } catch (e) {
            throw new Error(`Unable to copy assets: ${e.message || e}`);
        }

        try {
            if (
                this.project.staticResourcesDirectories &&
                this.project.staticResourcesDirectories.length > 0
            ) {
                const staticResourcesAssetsPath = path.join(
                    serverAssetsPath,
                    'project'
                );
                this.project.staticResourcesDirectories.forEach(item => {
                    copyFiles(path.join(item, '*'), staticResourcesAssetsPath);
                });
            }
        } catch (e) {
            throw new Error(
                `Unable to copy static resources: ${e.message || e}`
            );
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
            this.rootDir,
            'node_modules',
            '@salesforce',
            'lwc-dev-server-dependencies',
            'vendors'
        );

        const vendoredModules = fs.readdirSync(vendoredModulesPath);

        return vendoredModules.map(module => {
            return module.split('-')[1];
        });
    }
}

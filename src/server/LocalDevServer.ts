import path from 'path';
import fs from 'fs';
import uuidv4 from 'uuidv4';
import Project from '../common/Project';
import WebruntimeConfig from './config/WebruntimeConfig';
import { sessionNonce, projectMetadata, liveReload } from './extensions';
import { ContainerAppExtension, ServiceDefinitionCtor } from '@webruntime/api';
import { Server } from '@webruntime/server';
import { getCustomComponentService } from './services/CustomComponentService';
import { copyFiles } from '../common/fileUtils';
import { getLabelService } from './services/LabelsService';
import { ComponentServiceWithExclusions } from './services/ComponentServiceWithExclusions';
import colors from 'colors';
import { AddressInfo } from 'net';

export default class LocalDevServer {
    private server: Server;
    private config: WebruntimeConfig;
    private rootDir: string;
    private project: Project;
    private liveReload?: any;
    private readonly sessionNonce: string;
    private readonly vendorVersion: string | undefined;

    constructor(project: Project) {
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

        config.addMiddleware([sessionNonce(this.sessionNonce)]);

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
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/force-pkg`
        ]);

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

    async initialize() {
        await this.server.initialize();
        this.copyStaticAssets();
        // graceful shutdown
        process.on('SIGINT', async () => this.exitHandler());
        process.on('SIGTERM', async () => this.exitHandler());
    }

    private async exitHandler() {
        this.server.shutdown();
        process.exit();
    }

    /**
     * Starts the server. If the server successfully started and contains
     * an address, print that the server is up.
     */
    async start() {
        await this.start();

        let port = `${this.serverPort}`;
        if (port && port !== 'undefined') {
            console.log(
                colors.magenta.bold(`Server up on http://localhost:${port}`)
            );
        } else {
            console.error(`Server start up failed.`);
        }
    }

    /**
     * Verify the server is up and contains an address. Retrieve the port from
     * this address for console logging. The configured port may not what the server
     * is using, so retrieve the port directly from the server address.
     */
    get serverPort() {
        if (this.server.httpServer && this.server.httpServer.address()) {
            const addressInfo: AddressInfo = this.server.httpServer.address() as AddressInfo;
            return addressInfo.port;
        }
    }

    private copyStaticAssets() {
        // copy app static resources
        const distAssetsPath = path.join(this.rootDir, 'dist', 'assets');
        // @ts-ignore
        const serverAssetsPath = path.join(this.config.buildDir, 'assets');

        try {
            copyFiles(path.join(distAssetsPath, '*'), serverAssetsPath);
        } catch (e) {
            throw new Error(`Unable to copy assets: ${e.message || e}`);
        }

        // TODO: copy assets from project.staticResourcesDirectory
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

import path from 'path';
import fs from 'fs';
import uuidv4 from 'uuidv4';
import Project from '../common/Project';
import WebruntimeConfig from './config/WebruntimeConfig';
import { sessionNonce, projectMetadata, liveReload } from './extensions';
import { Server, Container } from '@webruntime/server';
import { getCustomComponentService } from './services/CustomComponentService';
import { copyFiles } from '../common/fileUtils';
import { getLabelService } from './services/LabelsService';
import { ComponentServiceWithExclusions } from './services/ComponentServiceWithExclusions';
import colors from 'colors';

export default class LocalDevServer extends Server {
    private rootDir: string;
    private project: Project;
    private readonly sessionNonce: string;
    private readonly vendorVersion: string | undefined;

    constructor(project: Project) {
        // create a default LWR server
        super();

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

        const options = {
            basePath: '',
            projectDir: this.rootDir,
            port: project.configuration.port.toString(),
            resourceRoot: '/webruntime'
        };

        // @ts-ignore
        const config = new WebruntimeConfig(this.config, this.project);

        config.addMiddleware([sessionNonce(this.sessionNonce)]);

        config.addRoutes([
            projectMetadata(this.sessionNonce, this.project),
            liveReload(path.join(config.buildDir, 'metadata.json'))
        ]);

        config.addModules([
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/force-pkg`
        ]);

        const services: any[] = [
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

        // override LWR defaults
        // @ts-ignore
        this.options = options;
        // @ts-ignore
        this.config = config;
        // @ts-ignore
        this.container = new Container(this.config);
    }

    async initialize() {
        await super.initialize();
        this.copyStaticAssets();
        // graceful shutdown
        process.on('SIGINT', async () => this.exitHandler());
        process.on('SIGTERM', async () => this.exitHandler());
    }

    private async exitHandler() {
        this.shutdown();
        process.exit();
    }

    async start() {
        await super.start();

        console.log(
            colors.magenta.bold(`Server up on http://localhost:${this.port}`)
        );
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

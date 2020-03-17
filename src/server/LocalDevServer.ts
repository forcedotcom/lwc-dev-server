import path from 'path';
import fs from 'fs';
// import { Server } from '@webruntime/server';
const { Server } = require('@webruntime/server');
import { Request, Response, NextFunction } from 'express';
import uuidv4 from 'uuidv4';
import reload from 'reload';
import chokidar from 'chokidar';
import ComponentIndex from '../common/ComponentIndex';
import Project from '../common/Project';

const ALLOWED_SHOW_EXTENSIONS: { [key: string]: boolean } = {
    '.html': true,
    '.css': true,
    '.js': true
};

export default class LocalDevServer {
    private server: any;
    private project: Project;
    private readonly sessionNonce: string;

    private liveReload: any;
    private fileWatcher: chokidar.FSWatcher | undefined;

    constructor(project: any) {
        this.sessionNonce = uuidv4();
        this.project = project;

        let vendorVersion = project.configuration.core_version;
        const supportedCoreVersions = this.getSupportedCoreVersions();

        if (!supportedCoreVersions.includes(vendorVersion)) {
            // fallback to latest support core version
            vendorVersion =
                supportedCoreVersions[supportedCoreVersions.length - 1];
        }

        // set environment variables to be accessible in webruntime config
        process.env.LOCALDEV_PORT =
            project.configuration.port.toString() || '3333';
        process.env.LOCALDEV_VENDOR_VERSION = vendorVersion;
        process.env.PROJECT_ROOT = project.directory;
        process.env.PROJECT_NAMESPACE = project.configuration.namespace;
        process.env.PROJECT_LWC_MODULES = path.join(
            project.modulesSourceDirectory,
            'main',
            'default'
        );

        this.server = new Server({
            projectDir: path.join(__dirname, '..', '..')
        });
    }

    async initialize() {
        // add middleware before initializing the LWR server
        this.registerLocalsProvider();

        await this.server.initialize();

        // add api endpoints after initializing the LWR server
        this.mountApiEndpoints();

        if (this.project.configuration.liveReload) {
            await this.mountLiveReload();
        }
    }

    async start() {
        await this.server.start();
    }

    async close() {
        if (this.fileWatcher) {
            await this.fileWatcher.close();
        }

        if (this.liveReload) {
            await this.liveReload.closeServer();
        }

        await this.server.shutdown();
    }

    /**
     * Get supported core versions of vendored modules
     */
    getSupportedCoreVersions() {
        const vendoredModulesPath = path.join(
            __dirname,
            '..',
            '..',
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

    /**
     * Adds data to the res.locals property so its accessible
     * in the LocalDevApp class
     */
    registerLocalsProvider() {
        this.server.app.use(
            (req: Request, res: Response, next: NextFunction) => {
                res.locals.sessionNonce = this.sessionNonce;
                next();
            }
        );
    }

    /**
     * Add routes to express for fetching the following.
     * - /localdev/${this.sessionNonce}/localdev.js - JS version for embedding in the template of the project configuration.
     * - /localdev/${this.sessionNonce}/show - API end point to get the source of a particular component file
     */
    mountApiEndpoints() {
        this.server.app.get(
            `/localdev/${this.sessionNonce}/localdev.js`,
            (req: Request, res: Response, next: NextFunction) => {
                const componentIndex = new ComponentIndex(this.project);
                const json = componentIndex.getProjectMetadata();
                const localDevConfig = {
                    project: json
                };
                res.type('js');
                res.send(
                    `window.LocalDev = ${JSON.stringify(localDevConfig)};`
                );
            }
        );

        this.server.app.get(
            `/localdev/${this.sessionNonce}/show`,
            (req: Request, res: Response, next: NextFunction) => {
                const file = req.query.file;
                const extension = path.extname(file);
                const normalizedFile = path.normalize(file);
                if (
                    normalizedFile.startsWith(
                        path.normalize(this.project.modulesSourceDirectory)
                    ) &&
                    ALLOWED_SHOW_EXTENSIONS[extension]
                ) {
                    res.sendFile(file);
                }
            }
        );
    }

    /**
     * Adds the live reload endpoint and starts the file watcher
     */
    async mountLiveReload() {
        this.liveReload = await reload(this.server.app);

        this.fileWatcher = chokidar
            // watch LWR build metadata for changes
            .watch(
                // cache-data directory will be moving in a future release of LWR
                path.join(__dirname, '..', '..', 'cache-data', 'metadata.json'),
                {
                    ignoreInitial: true
                }
            );

        // trigger a reload when the metadata has changed
        this.fileWatcher.on('change', () => {
            this.liveReload.reload();
        });
    }
}

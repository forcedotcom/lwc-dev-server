import path from 'path';
// import { Server } from '@webruntime/server';
const { Server } = require('@webruntime/server');
import { Request, Response, NextFunction } from 'express';
import ComponentIndex from '../common/ComponentIndex';
import uuidv4 from 'uuidv4';

const ALLOWED_SHOW_EXTENSIONS: { [key: string]: boolean } = {
    '.html': true,
    '.css': true,
    '.js': true
};

export default class LocalDevServer {
    private server: any;
    private project: any;
    private readonly sessionNonce: string;

    constructor(project: any) {
        this.sessionNonce = uuidv4();
        this.project = project;

        // set environment variables to be accessible in webruntime config
        process.env.LOCALDEV_PORT =
            project.configuration.port.toString() || '3333';
        process.env.PROJECT_ROOT = project.directory;
        process.env.PROJECT_LWC_MODULES = path.join(
            project.modulesSourceDirectory,
            'main',
            'default'
        );

        this.server = new Server({
            projectDir: path.join(__dirname, '..', '..')
        });

        // Configure Express before startup
        this.registerLocalsProvider();
        this.mountApiEndpoints();
    }

    start() {
        return this.server.initialize().then(() => {
            this.server.start();
        });
    }

    close() {
        return this.server.shutdown();
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
     * - /localdev/${this.sessionNonce}/localdev.json - JSON payload of all project configuration.
     * - /localdev/${this.sessionNonce}/localdev.js - JS version for embedding in the template of the project configuration.
     * - /localdev/${this.sessionNonce}/show - API end point to get the source of a particular component file
     */
    mountApiEndpoints() {
        this.server.app.get(
            `/localdev/${this.sessionNonce}/localdev.json`,
            (req: Request, res: Response, next: NextFunction) => {
                const componentIndex = new ComponentIndex(this.project);
                const json = componentIndex.getProjectMetadata();
                res.json(json);
            }
        );

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
}

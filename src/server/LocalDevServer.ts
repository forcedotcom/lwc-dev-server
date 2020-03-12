const path = require('path');
const { Server } = require('@webruntime/server');

export default class LocalDevServer {
    private server: any;

    constructor(project: any) {
        // set environment variables to be accessible in webruntime config
        process.env.LOCALDEV_PORT =
            project.configuration.port.toString() || '3333';
        process.env.PROJECT_ROOT = project.directory;
        process.env.PROJECT_NAMESPACE = project.configuration.namespace;
        process.env.PROJECT_LWC_MODULES =
            (project.modulesSourceDirectory as string) + '/main/default';

        this.server = new Server({
            projectDir: path.join(__dirname, '..', '..')
        });
    }

    start() {
        return this.server.initialize().then(() => {
            this.server.start();
        });
    }

    close() {
        return this.server.shutdown();
    }
}

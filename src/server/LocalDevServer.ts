const path = require('path');
const { Server } = require('@webruntime/server');

export default class LocalDevServer {
    private server: any;

    constructor(project: any) {
        const version =
            project.configuration.api_version !== undefined
                ? parseInt(project.configuration.api_version, 10) * 2 + 128
                : 0;

        // set environment variables to be accessible in webruntime config
        process.env.LOCALDEV_PORT =
            project.configuration.port.toString() || '3333';
        process.env.PROJECT_ROOT = project.directory;
        process.env.PROJECT_API_VERSION = version.toString();
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

    start() {
        return this.server.initialize().then(() => {
            this.server.start();
        });
    }

    close() {
        return this.server.shutdown();
    }
}

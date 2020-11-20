import debugLogger from 'debug';
import Project from '../../src/common/Project';
import BaseEnvironment from './BaseEnvironment';
import LocalDevServer from '../../src/server/LocalDevServer';
import { defaultPort } from '../../src/user/LocalDevServerConfiguration';

const debug = debugLogger('localdevserver:test');

/**
 * Starts the dev server programmatically.
 *
 * Explicitly use this environment for all tests in the file by adding a
 * `@jest-environment` docblock at the top of the file:
 *
 * `@jest-environment ./environment/DefaultEnvironment.js`
 *
 * By default the server will be started using the `project` directory (relative
 * to the test directory) as the cwd. You can specify an explicit test project
 * with a jest docblock pragma:
 *
 * `@project ../path/to/project`
 *
 * This environment makes the following global values available:
 * - `global.serverPort` - the port the server was started on.
 *
 * @see https://jestjs.io/docs/en/configuration#testenvironment-string
 */
export default class DefaultEnvironment extends BaseEnvironment {
    server?: LocalDevServer;
    private processHandlers: { [key: string]: (...args: any[]) => void } = {};

    async setup() {
        await super.setup();

        debug(`Setting up DefaultEnvironment for: ${this.projectPath}`);

        const project = new Project(this.projectPath);
        if (!project.configuration.api_version) {
            debug('no api version specified, using 50.0');
            project.configuration.api_version = '50.0';
        }
        if (
            project.configuration.port === undefined ||
            project.configuration.port === null ||
            project.configuration.port === defaultPort
        ) {
            const port = 0; // random available port
            project.configuration.port = port;
        }

        this.server = new LocalDevServer(project);
        await this.server.start();

        this.global.serverPort = this.server.serverPort;

        // jest does not call teardown on interruption
        const exitHandler = async () => this.stopServer();
        this.processHandlers['SIGINT'] = exitHandler;
        this.processHandlers['SIGTERM'] = exitHandler;
        process.on('SIGINT', exitHandler);
        process.on('SIGTERM', exitHandler);

        debug(`started server on port ${this.global.serverPort}`);
    }

    async teardown() {
        await this.stopServer();
        await super.teardown();

        Object.entries(this.processHandlers).forEach(([event, handler]) => {
            process.off(event, handler);
        });
    }

    async stopServer() {
        if (this.server) {
            await this.server.shutdown();
            debug('stopped server');
        }
    }
}

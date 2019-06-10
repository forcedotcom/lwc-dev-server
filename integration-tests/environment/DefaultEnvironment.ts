import debug from 'debug';
import Project from '../../src/common/Project';
import BaseEnvironment from './BaseEnvironment';
import LocalDevServer from '../../src/server/LocalDevServer';
import { defaultPort } from '../../src/user/LocalDevServerConfiguration';

const log = debug('localdevserver');

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

    async setup() {
        await super.setup();

        const project = new Project(this.projectPath);
        if (!project.configuration.api_version) {
            log('no api version specified, using 45.0');
            project.configuration.api_version = '45.0';
        }
        if (
            project.configuration.port === undefined ||
            project.configuration.port === null ||
            project.configuration.port === defaultPort
        ) {
            const port = 0; // random available port
            project.configuration.port = port;
        }

        this.server = new LocalDevServer();
        await this.server.start(project);
        this.global.serverPort = this.server.port;
        log('started server');
    }

    async teardown() {
        if (this.server) {
            this.server.stop();
            log('stopped server');
        }
        await super.teardown();
    }
}

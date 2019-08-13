import path from 'path';
import debug from 'debug';
import BaseEnvironment from './BaseEnvironment';
import { spawn, ChildProcess } from 'child_process';
import { EnvironmentContext } from '@jest/environment';
import { Config } from '@jest/types';

const log = debug('localdevserver');

/**
 * Starts the dev server by spawning a child process that runs the `bin/run`
 * command.
 *
 * This is for tests that need to run the cli command for a specific reason,
 * e.g., testing code from the oclif plugin.
 *
 * Explicitly use this environment for all tests in the test file by adding a
 * `@jest-environment` docblock at the top of the file:
 *
 * `@jest-environment ./environment/CliEnvironment.js`
 *
 * By default the server will be started using the `project` directory (relative
 * to the test directory) as the cwd. You can specify an explicit test project
 * with a jest docblock pragma:
 *
 * `@project ../path/to/project`
 *
 * Other options:
 *
 * - `@command force:lightning:lwc:dev`
 * - `@command-args --port=3339 --open=c:hello`
 *
 * This environment makes the following global values available:
 * - `global.serverPort` - the port the server was started on.
 *
 * @see https://jestjs.io/docs/en/configuration#testenvironment-string
 */
export default class CliEnvironment extends BaseEnvironment {
    execPath: string;
    command: string;
    commandArgs: Array<string>;
    serverProcess?: ChildProcess;
    startupTimeoutMillis: number;

    constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
        super(config, context);

        const params = context.docblockPragmas || {};

        this.execPath = path.join(__dirname, '..', '..', 'bin', 'run');
        if (process.platform === 'win32') {
            this.execPath = path.join(__dirname, '..', '..', 'bin', 'run.cmd');
        }
        this.startupTimeoutMillis = 20000;

        let command = 'force:lightning:lwc:dev';
        if (params['command']) {
            const commandValue = params['command'];
            if (Array.isArray(commandValue)) {
                throw new Error('value for @command must be a single string');
            }
            command = commandValue;
        }
        this.command = command;

        let commandArgs: Array<string> = [];
        if (params['command-args']) {
            const value = params['command-args'];
            if (Array.isArray(value)) {
                commandArgs = value.map(v => v.trim());
            } else {
                commandArgs = value.split(' ').map(v => v.trim());
            }
        }
        this.commandArgs = commandArgs;
    }

    async setup(): Promise<void> {
        await super.setup();

        const portArg = this.commandArgs.find(arg => arg.startsWith('--port'));
        if (portArg === undefined) {
            const port = 0; // random available port
            this.commandArgs.push(`--port=${port}`);
        }

        const serverStartup = new Promise<void>(async (resolve, reject) => {
            log('spawning new server');
            const serverProcess = spawn(
                this.execPath,
                [this.command, ...this.commandArgs],
                {
                    cwd: this.projectPath,
                    shell: process.platform === 'win32'
                }
            );

            serverProcess.stdout.on('data', data => {
                const stdout = data.toString('utf8');
                log(stdout);
                if (/server up/i.test(stdout)) {
                    log('server up');
                    const match = stdout.match(/:([0-9]+)/);
                    if (match === null) {
                        reject(new Error('unable to determine server port'));
                    }
                    const port = match[1];
                    this.global.serverPort = port;
                    resolve();
                }
            });

            serverProcess.stderr.on('data', data => {
                const stderr = data.toString('utf8');
                console.error(stderr);
                // too much stuff is printing logs to stderr
                // reject(new Error(stderr));
            });

            serverProcess.on('error', err => {
                log('failed to start/run server');
                reject(err);
            });

            this.serverProcess = serverProcess;
        });

        let timer: NodeJS.Timeout;
        const startupTimeout = new Promise<void>(async (resolve, reject) => {
            timer = setTimeout(() => {
                reject(new Error('timed out waiting for server to start'));
            }, this.startupTimeoutMillis);
        });

        return Promise.race([serverStartup, startupTimeout]).then(() => {
            clearTimeout(timer);
        });
    }

    async teardown() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            log('killed server process');
        }
        await super.teardown();
    }
}

module.exports = CliEnvironment;

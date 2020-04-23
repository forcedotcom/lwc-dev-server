import debug from 'debug';
import CliEnvironment from './CliEnvironment';
import { EnvironmentContext } from '@jest/environment';
import { Config } from '@jest/types';
import jsforce from 'jsforce';
import { AuthInfo, Connection } from '@salesforce/core';

const log = debug('localdevserver');

/**
 * Starts the dev server programmatically.
 *
 * Explicitly use this environment for all tests in the file by adding a
 * `@jest-environment` docblock at the top of the file:
 *
 * `@jest-environment ./environment/AuthenticatedEnvironment.js`
 *
 * By default the server will be started using the `project` directory (relative
 * to the test directory) as the cwd. You can specify an explicit test project
 * with a jest docblock pragma:
 *
 * `@project ../path/to/project`
 *
 * Other options:
 *
 * - `@command force:lightning:lwc:start`
 * - `@command-args --port=3339 --open=c:hello`
 * - `@command-token <authorization token>`
 *
 * This environment makes the following global values available:
 * - `global.serverPort` - the port the server was started on.
 *
 * @see https://jestjs.io/docs/en/configuration#testenvironment-string
 */

declare global {
    namespace NodeJS {
        interface Global {
            jsforceConnection: jsforce.Connection;
        }
    }
}

export default class AuthenticatedEnvironment extends CliEnvironment {
    private token: string | string[] | null = null;

    constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
        super(config, context);
        const params = context.docblockPragmas || {};
        if (params['command-token']) {
            this.token = params['command-token'];
        }
    }

    async setup(): Promise<void> {
        if (this.token === null) {
            // const connection = new jsforce.Connection({});
            // this.global.jsforceConnection = connection;
            const user: string | undefined =
                process.env.SFDX_CI_LOCALDEV_USERNAME;
            if (!user) {
                throw new Error(
                    'Required SFDX_CI_LOCALDEV_USERNAME environment variable not provided'
                );
            }

            console.log(`Logging in as ${user}`);
            console.log('  Creating authinfo...');
            const authInfo = await AuthInfo.create({ username: user });
            console.log('  Accessing authinfo...');
            const authInfoFields = authInfo.getFields();
            const instanceUrl = authInfoFields.instanceUrl || 'NO-URL';
            this.token = authInfoFields.accessToken || 'NO-ACCESS-TOKEN';
            const isJwt = authInfo.isJwt();
            console.log(`  Creating a connection to: ${instanceUrl}...`);
            console.log(`  [isJwt=${isJwt}, accessToken=${this.token}]`);
            this.global.jsforceConnection = await Connection.create({
                authInfo
            });
            console.log(`Logged in ${user} using JWT`);

            /*
            this.token = await (async function() {
                return new Promise<string>((resolve, reject) => {
                    connection.login(user, process.env.SFDC_PWD || '', err => {
                        if (!err) {
                            return resolve(connection.accessToken);
                        }
                        console.error(JSON.stringify(err));
                        reject(err);
                    });
                });
            })();
            const authInfo = await AuthInfo.create({
                username: user,
                accessTokenOptions: {
                    instanceUrl: connection.instanceUrl,
                    accessToken: connection.accessToken,
                    loginUrl: 'https://login.salesforce.com'
                }
            });
            authInfo.save();
*/
            this.commandArgs.push(`--targetusername=${user}`);
        }

        return super.setup();
    }
}

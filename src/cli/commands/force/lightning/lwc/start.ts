/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import Project from '../../../../../common/Project';
import LocalDevServer from '../../../../../server/LocalDevServer';
import LocalDevTelemetryReporter from '../../../../../instrumentation/LocalDevTelemetryReporter';
import debugLogger from 'debug';
import colors from 'colors';
import uuidv4 from 'uuidv4';
import { ServerConfiguration } from '../../../../../common/types';
import { DEFAULT_PORT } from '../../../../../common/Constants';
const debug = debugLogger('localdevserver');

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/lwc-dev-server', 'start');

export default class Start extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:lighting:lwc:start`,
        `$ sfdx force:lighting:lwc:start --port 3000`
    ];

    public static args = [];

    protected static flagsConfig = {
        port: flags.integer({
            char: 'p',
            default: DEFAULT_PORT,
            description: messages.getMessage('portFlagDescription')
        })
    };

    protected static requiresProject = true;
    protected static requiresUsername = true;
    // Guaranteed by requires username
    protected org!: Org;

    public async run(): Promise<AnyJson> {
        const sessionNonce = uuidv4();
        const reporter = LocalDevTelemetryReporter.getInstance();
        await reporter.initializeService(sessionNonce);
        try {
            // Legal disclosure
            this.ux.log(colors.gray(messages.getMessage('legal:cliusage')));

            // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
            const conn = this.org.getConnection();

            // We are forcing to use 49.0 (Summer20/226) so we can communicate with 226 LDS.
            // Once we migrate to latest webruntime and LDS (W-8277943), we can remove this
            // and go back to using the highest API as below

            // Highest level API is always last
            // const api_version = await conn.retrieveMaxApiVersion();
            const api_version = '49.0';

            // Print the configuration details being used
            this.reportStatus(
                colors.green(this.org.getUsername() || ''),
                colors.green(api_version)
            );

            // check if username credentials are still valid
            await this.org.refreshAuth();

            const accessToken = conn.accessToken;
            const srvConfig: ServerConfiguration = {
                apiVersion: api_version,
                headers: [`Authorization: Bearer ${accessToken}`],
                instanceUrl: conn.instanceUrl,
                port: this.flags.port
            };
            const projectPath = this.project ? this.project.getPath() : '.';
            const project = new Project(projectPath, srvConfig);
            const retValue = {
                orgId: this.org.getOrgId(),
                api_version: project.configuration.api_version,
                endpoint: project.configuration.endpoint,
                endpointHeaders: project.configuration.endpointHeaders,
                port: project.configuration.port,
                token: accessToken
            };
            debug(
                JSON.stringify({
                    ...retValue,
                    token: undefined,
                    endpointHeaders: undefined
                })
            );
            // Start local dev server
            const server = new LocalDevServer(project, conn);
            await server.start();

            // graceful shutdown
            const exitHandler = async () => {
                this.ux.log('\nStopping local development server');
                await server.shutdown();
                process.exit();
            };

            process.on('SIGINT', exitHandler);
            process.on('SIGTERM', exitHandler);

            return retValue;
        } catch (e) {
            reporter.trackApplicationStartError(e.message);
            return Promise.reject(e);
        }
    }

    private reportStatus(orgUsername: string, apiVersion: string) {
        this.ux.log(
            `\nStarting LWC Local Development.\n\tUsername: ${orgUsername}\n\tApi Version: ${apiVersion}\n`
        );
    }
}

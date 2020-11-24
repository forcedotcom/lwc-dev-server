import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as http from 'http';
import Project from '../../../../../common/Project';
import LocalDevServer from '../../../../../server/LocalDevServer';
import { findLWCFolderPath } from '../../../../../common/fileUtils';
import debugLogger from 'debug';
import colors from 'colors';
const debug = debugLogger('localdevserver');

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/lwc-dev-server', 'start');

/**
 * Error codes for start command.
 * Process exits with error codes specified here if an error happens.
 * salesforcedx-vscode uses this as well as the stderr output to determine a user friendly message / action.
 */
export const errorCodes = {
    EPERM: 1
};

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
            description: messages.getMessage('portFlagDescription')
        })
    };

    // Comment this out if your command does not support specifying an org username
    protected static supportsUsername = true;

    // Comment this out if your command does not support a dev hub org username
    protected static supportsDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        const devhubusername = this.hubOrg ? this.hubOrg.getUsername() : '';
        const devhubalias = this.configAggregator.getPropertyValue(
            'defaultdevhubusername'
        ) as string;

        if (!this.org) {
            // This you DO need.
            // We require this right now for proxying and api version.
            // If we do not have an org, we can still function.
            //  - We should disable the proxying and then allow specification of the version
            //    if you don't authenticate.
            //

            const targetusername = this.flags.targetusername;
            if (targetusername) {
                this.reportStatus(
                    colors.green(devhubalias),
                    colors.red(
                        `${targetusername} - ${messages.getMessage(
                            'error:invalidscratchorgusername'
                        )}`
                    )
                );
            } else {
                const configuredusername = this.configAggregator.getPropertyValue(
                    'defaultusername'
                );
                this.reportStatus(
                    colors.green(devhubalias),
                    colors.red(
                        `${configuredusername} - ${messages.getMessage(
                            'error:noscratchorg'
                        )}`
                    )
                );
            }

            return { org: typeof this.org };
        }

        // Sfdx validates this before we have a chance to, this appears to be
        // a "just in case" condition so reporting the same error they do.
        if (!this.project) {
            this.ux.error(messages.getMessage('error:noproject'));
            return { project: typeof this.project };
        }

        const project = new Project(this.project.getPath());

        const lwcPath = findLWCFolderPath(project.modulesSourceDirectory);
        if (!lwcPath) {
            this.ux.log(
                colors.red(
                    `No 'lwc' directory found in path ${project.modulesSourceDirectory}`
                )
            );
            process.exit();
        }

        this.ux.log(colors.gray(messages.getMessage('legal:cliusage')));

        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        // Highest level API is always last
        const api_version = await conn.retrieveMaxApiVersion();

        const orgusername = this.org.getUsername() || '';
        try {
            // currently something in sfdx is resulting in an unhandled
            // promise rejection, instead of surfacing that rejection
            // through the returned promise. @W-6723813
            process.on('unhandledRejection', reason => {
                if (
                    reason &&
                    // @ts-ignore
                    reason.name &&
                    // @ts-ignore
                    reason.name === 'StatusCodeError'
                ) {
                    // ignore unhandled rejects during below refresh call
                    debug(`unhandledPromiseRejection: ${reason}`);
                } else {
                    this.ux.error(`unhandledPromiseRejection: ${reason}`);
                }
            });
            await this.org.refreshAuth();
        } catch (err) {
            this.reportError(
                colors.green(devhubalias),
                colors.red(
                    `${orgusername} - ${messages.getMessage(
                        'error:inactivescratchorg'
                    )}`
                ),
                colors.green(api_version)
            );
            err.exitCode = errorCodes.EPERM;
            throw err;
        }

        this.reportStatus(
            colors.green(devhubalias),
            colors.green(orgusername),
            colors.green(api_version)
        );

        const accessToken = conn.accessToken;

        project.configuration.api_version = api_version;
        project.configuration.endpoint = conn.instanceUrl;
        project.configuration.endpointHeaders = [
            `Authorization: Bearer ${accessToken}`
        ];
        project.configuration.port =
            this.flags.port !== undefined && this.flags.port !== null
                ? this.flags.port
                : project.port;

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
    }

    private getStatusMessage(
        devHubOrg: string,
        scratchOrg: string,
        apiVersion?: string
    ) {
        if (apiVersion) {
            return `\
Starting LWC Local Development.
    Dev Hub Org: ${devHubOrg}
    Scratch Org: ${scratchOrg}
    Api Version: ${apiVersion}\
`;
        } else {
            return `\
Starting LWC Local Development.
    Dev Hub Org: ${devHubOrg}
    Scratch Org: ${scratchOrg}\
`;
        }
    }

    private reportStatus(
        devHubOrg: string,
        scratchOrg: string,
        apiVersion?: string
    ) {
        this.ux.log(this.getStatusMessage(devHubOrg, scratchOrg, apiVersion));
    }

    private reportError(
        devHubOrg: string,
        scratchOrg: string,
        apiVersion?: string
    ) {
        this.ux.error(this.getStatusMessage(devHubOrg, scratchOrg, apiVersion));
    }
}

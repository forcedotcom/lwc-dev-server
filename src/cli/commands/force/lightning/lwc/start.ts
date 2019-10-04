import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as http from 'http';
import Project from '../../../../../common/Project';
import LocalDevServer from '../../../../../server/LocalDevServer';
import debugLogger from 'debug';
import colors from 'colors';

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
        const defaultdevhubusername = this.configAggregator.getPropertyValue(
            'defaultdevhubusername'
        ) as string;

        let port: number;
        if (this.flags.port !== undefined && this.flags.port !== null) {
            port = this.flags.port;
        } else {
            port = 3333;
        }

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
                    colors.green(defaultdevhubusername),
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
                    colors.green(defaultdevhubusername),
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
            this.reportStatus(
                colors.green(defaultdevhubusername),
                colors.red(
                    `${orgusername} - ${messages.getMessage(
                        'error:inactivescratchorg'
                    )}`
                ),
                colors.green(api_version)
            );
            return { error: err };
        }

        this.reportStatus(
            colors.green(defaultdevhubusername),
            colors.green(orgusername),
            colors.green(api_version)
        );

        const accessToken = conn.accessToken;

        // custom onProxyReq function to inject into Talon's proxy
        // this will insert the Authorization header to have the requests be authenticated
        const onProxyReq = function(
            proxyReq: http.ClientRequest,
            req: http.IncomingMessage,
            res: http.ServerResponse
        ) {
            proxyReq.setHeader('Authorization', `Bearer ${accessToken}`);
        };

        const project = new Project(this.project.getPath());

        project.configuration.api_version = api_version;
        project.configuration.endpoint = conn.instanceUrl;
        project.configuration.onProxyReq = onProxyReq;
        project.configuration.port = port;
        project.configuration.namespace = <string>(
            (await this.project.resolveProjectConfig()).namespace
        );

        const retValue = {
            orgId: this.org.getOrgId(),
            api_version: project.configuration.api_version,
            endpoint: project.configuration.endpoint,
            onProxyReq: JSON.stringify(project.configuration.onProxyReq),
            port,
            token: accessToken
        };
        debug(JSON.stringify({ ...retValue, token: undefined }));

        // Start local dev server
        new LocalDevServer().start(project, conn);

        return retValue;
    }

    private reportStatus(
        devHubOrg: string,
        scratchOrg: string,
        apiVersion?: string
    ) {
        if (apiVersion) {
            this.ux.log(`\
Starting LWC Local Development.
    Dev Hub Org: ${devHubOrg}
    Scratch Org: ${scratchOrg}
    Api Version: ${apiVersion}\
`);
        } else {
            this.ux.log(`\
Starting LWC Local Development.
    Dev Hub Org: ${devHubOrg}
    Scratch Org: ${scratchOrg}\
`);
        }
    }
}

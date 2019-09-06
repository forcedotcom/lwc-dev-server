import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
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
const messages = Messages.loadMessages('lwc-dev-server', 'start');

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

    // Comment this out if your command does not require an org username
    protected static supportsUsername = true;

    // Comment this out if your command does not support a hub org username
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

        if (!this.hubOrg) {
            // You don't need this.
            // As long as you have a scratch org we are fine.
        }

        if (!this.org) {
            // This you DO need.
            // We require this right now for proxying and api version.
            // If we do not have an org, we can still function.
            //  - We should disable the proxying and then allow specification of the version
            //    if you don't authenticate.
            //

            // this.flags.targetusername
            const targetusername = this.flags.targetusername;
            if (targetusername) {
                this.reportStatus(
                    colors.green(defaultdevhubusername),
                    colors.red(
                        `${targetusername} - Could not locate an active scratch org with this username / alias.`
                    )
                );
            } else {
                const configuredusername = this.configAggregator.getPropertyValue(
                    'defaultusername'
                );
                this.reportStatus(
                    colors.green(defaultdevhubusername),
                    colors.red(
                        `${configuredusername} - An active scratch org is required at this time. Please create one and make sure you either specify it as the default scratch org, or provide the user when you run the start command.`
                    )
                );
            }

            return { org: typeof this.org };
        }

        // Sfdx validates this before we have a chance to, this appears to be
        // a "just in case" condition so reporting the same error they do.
        if (!this.project) {
            this.ux.error(
                'RequiresProjectError: This command is required to run from within an SFDX project.'
            );
            return { project: typeof this.project };
        }

        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        // Highest level API is always last
        const api_version = await conn.retrieveMaxApiVersion();

        const orgusername = this.org.getUsername() || '';
        try {
            await this.org.refreshAuth();
        } catch (err) {
            this.reportStatus(
                colors.green(defaultdevhubusername),
                colors.red(
                    `${orgusername} - Error authenticating to your scratch org. Check that it is still Active.`
                ),
                colors.green(api_version)
            );
            return {};
        }

        // Whitespace is important for this block, make sure you don't indent it all.

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
        debug(JSON.stringify(retValue));

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
    Scratch Org: ${scratchOrg}}\
`);
        }
    }
}

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as http from 'http';
import Project from '../../../../../common/Project';
import LocalDevServer from '../../../../../server/LocalDevServer';
import debugLogger from 'debug';
import CLIErrorResolver from '../../../../CLIErrorResolver';
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

    private errorResolver: CLIErrorResolver | undefined;

    public async run(): Promise<AnyJson> {
        debugger;
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
            // We should disable the proxying and then allow specification of the version
            // if you don't authenticate.
            //

            //
            // Currently if you don't have an org, we should report that you need a username specified.
            //
            this.ux.error('org was undefined, an org is required.');
            return { org: typeof this.org };
        }

        if (!this.project) {
            this.ux.error(
                'project is undefined. this must be run from a sfdx worksapce'
            );
            return { project: typeof this.project };
        }

        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        // Used to later resolve friendly errors to the user
        this.errorResolver = new CLIErrorResolver(
            this.org,
            this.configAggregator
        );

        // Highest level API is always last
        const api_version = await conn.retrieveMaxApiVersion();
        const defaultdevhubusername = this.configAggregator.getPropertyValue(
            'defaultdevhubusername'
        ) as string;
        // Whitespace is important for this block, make sure you don't indent it all.
        this.ux.log(`\
Starting LWC Local Development.
    Dev Hub Org: ${colors.green(defaultdevhubusername)}
    Scratch Org: ${colors.green(this.org.getUsername() || '')}
    Api Version: ${colors.green(api_version)}\
        `);

        const accessToken = conn.accessToken;
        // custom onProxyReq function to inject into Talon's proxy
        // this will insert the Authorization header to have the requests be authenticated
        const onProxyReq = function(
            proxyReq: http.ClientRequest,
            req: http.IncomingMessage,
            res: http.ServerResponse
        ) {
            proxyReq.setHeader('Authorization', `Bearer ${accessToken}`);
            // req.headers.Cookie = `sid=${sid_cookie}`;
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

    protected async catch(err: SfdxError): Promise<any> {
        debugger;
        const friendlyMessage = this.errorResolver
            ? this.errorResolver.parse(err)
            : err + '';
        this.ux.error(colors.red(friendlyMessage));

        return;
    }
}

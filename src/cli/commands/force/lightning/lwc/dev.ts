import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson, JsonArray, JsonMap } from '@salesforce/ts-types';
import * as http from 'http';
import Project from '../../../../../common/Project';
import LocalDevServer from '../../../../../server/LocalDevServer';
import debugLogger from 'debug';

const debug = debugLogger('localdevserver');

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('lwc-dev-server', 'dev');

export default class Dev extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:lighting:lwc:dev`,
        `$ sfdx force:lighting:lwc:dev --port 3000`
    ];

    public static args = [{ open: 'file', name: 'lwc-dev' }];

    protected static flagsConfig = {
        port: flags.integer({
            char: 'p',
            description: messages.getMessage('portFlagDescription')
        })
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = true;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        let port: number;
        if (this.flags.port !== undefined && this.flags.port !== null) {
            port = this.flags.port;
        } else {
            port = 3333;
        }

        if (!this.org) {
            this.ux.log('org was undefined, an org is required.');
            return { org: typeof this.org };
        }

        if (!this.project) {
            this.ux.log(
                'project is undefined. this must be run from a sfdx worksapce'
            );
            return { project: typeof this.project };
        }

        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        // Highest level API is always last
        const api_version = await conn.retrieveMaxApiVersion();

        debug(
            `You appear to be running on a Salesforce instance that can support up to API level ${api_version}`
        );

        if (componentName) {
            debug(`You wanted to open this component: ${componentName}`);
        }

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
        new LocalDevServer().start(project);

        return retValue;
    }
}

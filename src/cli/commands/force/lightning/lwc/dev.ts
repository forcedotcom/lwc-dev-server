import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson, JsonArray, JsonMap } from '@salesforce/ts-types';
import * as http from 'http';
import Project from '../../../../../common/Project';
import SfdxConfiguration from '../../../../../user/SfdxConfiguration';
import LocalDevServer from '../../../../../LocalDevServer';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('lwc-dev-server', 'dev');

export default class Dev extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:lighting:lwc:dev --open myComponent`,
        `$ sfdx force:lighting:lwc:dev --stop`
    ];

    public static args = [{ open: 'file', name: 'lwc-dev' }];

    protected static flagsConfig = {
        open: flags.string({
            char: 'o',
            description: messages.getMessage('openFlagDescription')
        }),
        port: flags.integer({
            char: 'p',
            description: messages.getMessage('portFlagDescription')
        }),
        stop: flags.boolean({
            char: 's',
            description: messages.getMessage('stopFlagDescription')
        })
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = true;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        const componentName = this.flags.open;
        const port = this.flags.port || 8080;
        const stahp = this.flags.stop;
        if (stahp) {
            this.ux.log(messages.getMessage('stopMessage') + port);
            return { stopped: port };
        }

        if (!this.org) {
            this.ux.log('org was undefined, an org is required.');
            return { org: this.org };
        }

        if (!this.project) {
            this.ux.log(
                'project is undefined. this must be run from a sfdx worksapce'
            );
            return { project: this.project };
        }

        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        // Query the org for the API versions supported
        const result = <JsonArray>(
            await conn.request({ url: '/services/data/' })
        );

        if (!result || !result.length || result.length <= 0) {
            throw new SfdxError(
                messages.getMessage('errorNoOrgApis', [this.org.getOrgId()])
            );
        }

        // Highest level API is always last
        const api = <JsonMap>result[result.length - 1];

        this.ux.log(
            `You appear to be running on a Salesforce instance that can support up to API level ${
                api.version
            }`
        );

        if (componentName) {
            this.ux.log(`You wanted to open this component: ${componentName}`);
        }

        // Return an object to be displayed with --json
        const retValue = {
            orgId: this.org.getOrgId(),
            'api version': api.version,
            instance: conn.instanceUrl,
            token: conn.accessToken,
            componentName,
            port
        };
        this.ux.log(JSON.stringify(retValue));

        // TODO resolve location of `componentName`, ensure directory structure is imported / compiled

        // TODO check if it's already running on the port first

        // custom onProxyReq function to inject into Talon's proxy
        // this will insert the Authorization header to have the requests be authenticated
        const onProxyReq = function(writeBodyFunction: Function) {
            return (
                proxyReq: http.ClientRequest,
                req: http.IncomingMessage,
                res: http.ServerResponse
            ) => {
                req.headers = req.headers || {};
                req.headers.Authorization = `Bearer ${conn.accessToken}`;
                // req.headers.Cookie = `sid=${sid_cookie}`;
                return writeBodyFunction(proxyReq, req, res);
            };
        };

        const sfdxConfiguration = new SfdxConfiguration(this.project.getPath());
        sfdxConfiguration.setConfigValue('api_version', api.version);
        sfdxConfiguration.setConfigValue('endpoint', conn.instanceUrl);
        sfdxConfiguration.setConfigValue('onProxyReq', onProxyReq);
        sfdxConfiguration.setConfigValue('port', port);

        // Start local dev server
        new LocalDevServer().start(
            new Project(sfdxConfiguration),
            this.project.getPath()
        );

        // TODO open browser page to component

        return retValue;
    }
}
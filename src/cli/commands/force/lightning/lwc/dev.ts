import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson, JsonArray, JsonMap } from '@salesforce/ts-types';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('local-dev-server', 'dev');

export default class Dev extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:lighting:lwc:dev --open myComponent`,
        `$ sfdx force:lighting:lwc:dev --stop`
    ];

    public static args = [{ open: 'file', name: 'local-dev' }];

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

        // TODO Start local dev server

        // TODO open browser page to component

        return retValue;
    }
}

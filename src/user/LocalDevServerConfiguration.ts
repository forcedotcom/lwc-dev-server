import { ServerConfiguration } from 'common/Project';
export default class LocalDevServerConfiguration {
    private readonly srvConfig: ServerConfiguration;

    constructor(srvConfig: ServerConfiguration) {
        this.srvConfig = srvConfig;
    }

    /**
     * Namespace for the components on the filesystem.
     *
     * Currently, Local Dev Server only supports SFDX projects.
     * In SFDX projects, LWC components uses 'c' namespace.
     * https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_components_namespace
     */
    public get namespace(): string {
        return 'c';
    }

    /**
     * The address port for your local server. Defaults to 3333
     */
    public get port(): number {
        return this.srvConfig.port || 3333;
    }

    public get api_version(): string | undefined {
        return this.srvConfig.apiVersion;
    }

    public get core_version(): string | undefined {
        // Salesforce internal version == Salesforce API Version * 2 + 128
        // Example: 45 * 2 + 128 = 218
        return this.srvConfig.apiVersion !== undefined
            ? (parseInt(this.srvConfig.apiVersion, 10) * 2 + 128).toString()
            : undefined;
    }

    public get endpoint(): string | undefined {
        return this.srvConfig.instanceUrl;
    }

    public get endpointHeaders(): string[] {
        return this.srvConfig.headers || [];
    }

    public get liveReload(): boolean {
        return true;
    }
}

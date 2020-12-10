export const defaultPort = 3333;

export default class LocalDevServerConfiguration {
    private _liveReload: boolean = true;
    private _endpointHeaders: string[] = [];
    private entryPoint: string = '';
    private readonly configFromJson: any;

    constructor() {
        this.configFromJson = {};
    }

    /**
     * Get the specified container type.
     * Currently only supports 'component'
     *
     * To specify in json file, use
     * {
     *  "containerType": "..."
     * }
     */
    public get containerType(): string {
        return this.configFromJson.containerType || 'component';
    }

    /**
     * What is the default component to view in the preview container.
     *
     * To specify in json file, use
     * {
     *  "main": "..."
     * }
     */
    public get entryPointComponent(): string {
        // Returns this.entryPoint first as it gets configured on the cli
        // so if they specify that, it should override the json file.
        const entryPoint = this.entryPoint || this.configFromJson.main;
        if (!entryPoint) {
            return '';
        }

        if (!entryPoint.includes('/')) {
            return `${this.namespace}/${entryPoint}`;
        }

        return entryPoint;
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
     * To specify in json file, use
     * {
     *  "port": 3334
     * }
     */
    public get port(): number {
        let port = this.configFromJson.port;
        if (port !== undefined && port !== null && port !== '') {
            return port * 1;
        }

        return defaultPort;
    }

    public set port(port: number) {
        this.configFromJson.port = port;
    }

    public get api_version(): string | undefined {
        return this.configFromJson.api_version;
    }

    public set api_version(api_version: string | undefined) {
        this.configFromJson.api_version = api_version;
    }

    public get core_version(): string | undefined {
        // Salesforce internal version == Salesforce API Version * 2 + 128
        // Example: 45 * 2 + 128 = 218
        return this.configFromJson.api_version !== undefined
            ? (
                  parseInt(this.configFromJson.api_version, 10) * 2 +
                  128
              ).toString()
            : undefined;
    }

    public get endpoint(): string | undefined {
        return this.configFromJson.endpoint;
    }

    public set endpoint(endpoint: string | undefined) {
        this.configFromJson.endpoint = endpoint;
    }

    public get endpointHeaders(): string[] {
        return this._endpointHeaders || [];
    }

    public set endpointHeaders(endpointHeaders: string[]) {
        this._endpointHeaders = endpointHeaders;
    }

    public get liveReload(): boolean {
        return this._liveReload;
    }

    public set liveReload(liveReload: boolean) {
        this._liveReload = liveReload;
    }

    /**
     * When you run the project from the command line, you can specify configuration parameters.
     * Those need to get merged with this configuration object.
     *
     * TODO: Test and specify a type for the config object so we can access the main property.
     *
     * @param config Map of properties that were specified on the command line key=VALUE
     */
    public configureFromCliArguments(config: any) {
        if (config.hasOwnProperty('main')) {
            this.entryPoint = config.main;
        }
    }
}

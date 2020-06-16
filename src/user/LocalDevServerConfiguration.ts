import fs from 'fs';

export const defaultPort = 3333;

export default class LocalDevServerConfiguration {
    private _liveReload: boolean = true;
    private _endpointHeaders: string[] = [];
    private entryPoint: string = '';
    private readonly configFromJson: any;

    constructor(configFilePath?: string) {
        if (configFilePath) {
            let jsonFileContents = null;
            if (fs.existsSync(configFilePath)) {
                try {
                    jsonFileContents = fs.readFileSync(configFilePath, 'utf-8');
                } catch (e) {
                    console.error(
                        `Loading file ${configFilePath} failed with error: ${e}`
                    );
                }
            }
            if (jsonFileContents !== null && jsonFileContents !== '') {
                try {
                    this.configFromJson = JSON.parse(jsonFileContents);
                } catch (e) {
                    console.error(
                        `Loading JSON in '${configFilePath}' failed with the error ${e.message}`
                    );
                    this.configFromJson = {};
                }
            } else {
                this.configFromJson = {};
            }
        } else {
            this.configFromJson = {};
        }
        if (this.configFromJson.hasOwnProperty('liveReload')) {
            this._liveReload = !!this.configFromJson.liveReload;
        }
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
     * To specify in json file, use
     * {
     *  "namespace": "..."
     * }
     */
    public get namespace(): string {
        return this.configFromJson.namespace || 'c';
    }

    public set namespace(namespace: string) {
        this.configFromJson.namespace = namespace;
    }

    /**
     * To specify in json file, use
     * {
     *  "modulesSourceDirectory": "..."
     * }
     */
    public get modulesSourceDirectory(): string {
        return this.configFromJson.modulesSourceDirectory || '';
    }

    public set modulesSourceDirectory(directory: string) {
        this.configFromJson.modulesSourceDirectory = directory;
    }

    /**
     * To specify in json file, use
     * {
     *  "staticResourcesDirectories": "..."
     * }
     */
    public get staticResourcesDirectories(): string[] {
        return this.configFromJson.staticResourcesDirectories || [];
    }

    public set staticResourcesDirectories(directory: string[]) {
        this.configFromJson.staticResourcesDirectories = directory;
    }

    /**
     * To specify in json file, use
     * {
     *  "customLabelsFile": "..."
     * }
     */
    public get customLabelsFile(): string {
        return this.configFromJson.customLabelsFile || '';
    }

    public set customLabelsFile(file: string) {
        this.configFromJson.customLabelsFile = file;
    }

    public get contentAssetsPath(): string {
        return this.configFromJson.contentAssetUrlPath || '';
    }

    public set contentAssetsPath(path: string) {
        this.configFromJson.contentAssetUrlPath = path;
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

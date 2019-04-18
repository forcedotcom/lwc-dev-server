import fs from 'fs';

export default class LocalDevServerConfiguration {
    private entryPoint: string = '';
    private readonly configFromJson: any;

    constructor(configFilePath: string) {
        let jsonFileContents = null;
        try {
            jsonFileContents = fs.readFileSync(configFilePath, 'utf-8');
        } catch (e) {
            console.error(
                `Loading file ${configFilePath} failed with error: `,
                e
            );
        }

        if (jsonFileContents !== null && jsonFileContents !== '') {
            this.configFromJson = JSON.parse(jsonFileContents);
        } else {
            this.configFromJson = {};
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
    public getContainerType(): string {
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
    public getEntryPointComponent(): string {
        // Returns this.entryPoint first as it gets configured on the cli
        // so if they specify that, it should override the json file.
        return this.entryPoint || this.configFromJson.main;
    }

    /**
     * Namespace for the components on the filesystem.
     *
     * To specify in json file, use
     * {
     *  "namespace": "..."
     * }
     */
    public getNamespace(): string {
        return this.configFromJson.namespace || 'c';
    }

    /**
     * To specify in json file, use
     * {
     *  "moduleSourceDirectory": "..."
     * }
     */
    public getModuleSourceDirectory(): string {
        return this.configFromJson.moduleSourceDirectory || '';
    }

    /**
     * The address port for your local server. Defaults to 3333
     * To specify in json file, use
     * {
     *  "port": 3334
     * }
     */
    public getHostPort(): number {
        const defaultPort = 3333;
        let port = this.configFromJson.port;
        if (port === undefined || port === null) {
            return defaultPort;
        }

        port = port * 1;

        // If there is no port, default to http://localhost/ which is port 80 by default.
        if (port === 0) {
            port = 80;
        }

        return port || defaultPort;
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

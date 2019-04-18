import fs from 'fs';

export default class LocalDevServerConfiguration {
    private entryPoint: string = '';
    private readonly configFromJson: any;

    constructor(configFilePath: string) {
        const jsonFileContents = fs.readFileSync(configFilePath, 'utf-8');

        if (jsonFileContents !== null && jsonFileContents !== '') {
            this.configFromJson = JSON.parse(jsonFileContents);
        } else {
            this.configFromJson = {};
        }
    }

    /**
     * Get the specified container type.
     * Currently only supports 'component'
     */
    public getContainerType(): string {
        return this.configFromJson.containerType || 'component';
    }

    /**
     * What is the default component to view in the preview container.
     */
    public getEntryPointComponent(): string {
        // Returns this.entryPoint first as it gets configured on the cli
        // so if they specify that, it should override the json file.
        return this.entryPoint || this.configFromJson.main;
    }

    /**
     * Namespace for the components on the filesystem.
     */
    public getNamespace(): string {
        return this.configFromJson.namespace || 'c';
    }

    /**
     *
     */
    public getModuleSourceDirectory(): string {
        return this.configFromJson.moduleSourceDirectory || '';
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

class LocalDevServerConfiguration {
    private entryPoint: string = 'app';

    constructor(configFilePath: string) {}

    /**
     * Get the specified container type.
     * Currently only supports 'component'
     */
    public getContainerType(): string {
        return 'component';
    }

    public getEntryPointComponent(): string {
        return this.entryPoint;
    }

    public getNamespace(): string {
        return 'c';
    }

    public getModuleSourceDirectory(): string {
        return 'src/';
    }

    /**
     * When you run the project from the command line, you can specify configuration parameters.
     * Those need to get merged with this configuration object.
     *
     * TODO: Test and specify a type for the config object so we can access the main property.
     *
     * @param config Map of properties that were specified on the command line key=VALUE
     */
    public configureFromCliArguments(config: object) {
        if (config.hasOwnProperty('main')) {
            //this.entryPoint = config.main;
        }
    }
}

export default LocalDevServerConfiguration;

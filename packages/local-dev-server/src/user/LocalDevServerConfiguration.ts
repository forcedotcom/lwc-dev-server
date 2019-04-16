class LocalDevServerConfiguration {
    /**
     * Get the specified container type.
     * Currently only supports 'component'
     */
    public getContainerType(): string {
        return 'component';
    }

    public getEntryPointComponent(): string {
        return 'app';
    }

    public getNamespace(): string {
        return '';
    }
}

export default LocalDevServerConfiguration;

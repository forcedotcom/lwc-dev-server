export default class SfdxConfiguration {
    constructor(configFileLocation: string) {}

    public hasConfigurationFile(): boolean {
        return false;
    }

    public getPackageDirectories(): string[] {
        return [];
    }
}

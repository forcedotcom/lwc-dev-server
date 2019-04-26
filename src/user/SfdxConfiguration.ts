import fs from 'fs';

export default class SfdxConfiguration {
    private readonly _hasConfigurationFile: boolean = false;
    private readonly configFromJson: any = {};

    constructor(configFilePath?: string) {
        if (configFilePath) {
            let jsonFileContents = null;
            if (fs.existsSync(configFilePath)) {
                try {
                    jsonFileContents = fs.readFileSync(configFilePath, 'utf-8');
                } catch (e) {
                    this._hasConfigurationFile = false;
                }
            }
            if (jsonFileContents !== null && jsonFileContents !== '') {
                this.configFromJson = JSON.parse(jsonFileContents);
                this._hasConfigurationFile = true;
            } else {
                this.configFromJson = {};
            }
        }
    }

    public hasConfigurationFile(): boolean {
        return this._hasConfigurationFile;
    }

    public getPackageDirectories(): string[] {
        return [];
    }
}

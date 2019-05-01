import fs from 'fs';
import path from 'path';

export default class SfdxConfiguration {
    private readonly configMap: any = {};
    private readonly _path: string;
    private readonly packageDirectories: string[] = [];

    constructor(sfdxPath: string) {
        this._path = sfdxPath;

        let jsonFileContents = null;
        if (fs.existsSync(path.join(this._path, 'sfdx-project.json'))) {
            try {
                jsonFileContents = fs.readFileSync(
                    'sfdx-project.json',
                    'utf-8'
                );
            } catch (e) {}
        }
        if (jsonFileContents !== null && jsonFileContents !== '') {
            this.configMap = JSON.parse(jsonFileContents);

            if (this.configMap.packageDirectories instanceof Array) {
                let defaultPackage: string = '';
                this.configMap.packageDirectories.forEach(
                    (element: { default: boolean; path: string }) => {
                        if (element.default) {
                            defaultPackage = element.path;
                        } else {
                            this.packageDirectories.push(element.path);
                        }
                    }
                );
                if (defaultPackage) {
                    this.packageDirectories.unshift(defaultPackage);
                }
            }
        }
    }

    public setConfigValue(name: string, value: any) {
        this.configMap[name] = value;
    }

    public getPath(): string {
        return this._path;
    }

    public get(name: string): any {
        return this.configMap[name];
    }

    public getPackageDirectories(): string[] {
        return this.packageDirectories;
    }

    public getNamespace(): string {
        return this.configMap.namespace;
    }
}

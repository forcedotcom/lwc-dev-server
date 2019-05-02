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

    public getPath(): string {
        return this._path;
    }

    public getPackageDirectories(): string[] {
        return this.packageDirectories;
    }

    public get namespace(): string {
        return this.configMap.namespace;
    }

    public set namespace(namespace: string) {
        this.configMap.namespace = namespace;
    }

    public get api_version(): string {
        return this.configMap.api_version;
    }

    public set api_version(api_version: string) {
        this.configMap.api_version = api_version;
    }

    public get endpoint(): string {
        return this.configMap.endpoint;
    }

    public set endpoint(endpoint: string) {
        this.configMap.endpoint = endpoint;
    }

    public get onProxyReq(): Function {
        return this.configMap.onProxyReq;
    }

    public set onProxyReq(onProxyReq: Function) {
        this.configMap.onProxyReq = onProxyReq;
    }

    public get port(): number {
        return this.configMap.port;
    }

    public set port(port: number) {
        this.configMap.port = port;
    }
}

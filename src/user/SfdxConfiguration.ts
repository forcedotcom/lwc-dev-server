import fs from 'fs';
import path from 'path';
import Project from '../common/Project';

export default class SfdxConfiguration {
    private readonly configMap: any = {};
    private readonly packageDirectories: string[] = [];

    constructor(project: Project) {
        const _path = project.directory;

        let jsonFileContents = null;
        const sfdxProjectPath = path.join(_path, 'sfdx-project.json');
        if (fs.existsSync(sfdxProjectPath)) {
            try {
                jsonFileContents = fs.readFileSync(sfdxProjectPath, 'utf-8');
            } catch (e) {
                console.error(
                    `Loading ${sfdxProjectPath} failed JSON parsing with error ${
                        e.message
                    }`
                );
            }
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

    public getPackageDirectories(): string[] {
        return this.packageDirectories;
    }

    public get namespace(): string {
        return this.configMap.namespace || 'c';
    }

    public set namespace(namespace: string) {
        this.configMap.namespace = namespace || 'c';
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

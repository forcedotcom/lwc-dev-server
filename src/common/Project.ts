import fs from 'fs-extra';
import path from 'path';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import { SfdxProject } from '@salesforce/core';

/**
 * The project object describes two things.
 *
 * App Structure.
 * It resolves the location of your package.json file. It'll resolve the
 * location of your modules directory and other locations for assets we'll need to run the server.
 *
 * Configuration
 * Contains the configuration object we'll use to run the Local Dev Server.
 */
export default class Project {
    /**
     * Would not be valid if you ran the command on a directory without a package.json file.
     */
    private readonly rootDirectory: string;
    private readonly _isSFDX: boolean = false;
    private readonly _configuration: LocalDevServerConfiguration;

    constructor(directory: string) {
        // Directory could be either the project, or a folder in a project.
        // Resolve to find the right folder.
        const rootDirectory = this.resolveProjectDirectory(directory);

        if (rootDirectory === null) {
            throw new Error(
                `Directory specified '${directory}' does not resolve to a project. The specified directory must have package.json or sfdx-project.json in it.`
            );
        }

        this.rootDirectory = rootDirectory;

        // Base configuration for the project.
        // Also merges the config at localdevserver.config.json as well
        const configurationPath = path.join(
            this.rootDirectory,
            'localdevserver.config.json'
        );
        this._configuration = new LocalDevServerConfiguration(
            configurationPath
        );

        // Use detection of the sfdx-project configuration to detect if this is an Sfdx Project and we should
        // treat it as such.
        this._isSFDX = fs.existsSync(
            path.join(this.rootDirectory, 'sfdx-project.json')
        );

        if (this._isSFDX) {
            this.initWithSfdxConfiguration();
        }
    }

    public get configuration(): LocalDevServerConfiguration {
        return this._configuration;
    }

    public get isSfdx(): boolean {
        return this._isSFDX;
    }

    public get modulesSourceDirectory(): string {
        if (path.isAbsolute(this.configuration.modulesSourceDirectory)) {
            return this.configuration.modulesSourceDirectory;
        }
        return path.join(
            this.rootDirectory,
            this.configuration.modulesSourceDirectory || 'src'
        );
    }

    public get staticResourcesDirectory(): string {
        if (path.isAbsolute(this.configuration.staticResourcesDirectory)) {
            return this.configuration.staticResourcesDirectory;
        }
        return path.join(
            this.rootDirectory,
            this.configuration.staticResourcesDirectory
        );
    }

    /**
     * The Root directory of the Project.
     * Where the package.json or the root sfdx-project.json file is located.
     */
    public get directory(): string {
        return this.rootDirectory;
    }

    // Look for package.json or go up directories until found
    private resolveProjectDirectory(
        directory: string,
        previousDirectory?: string
    ): string | null {
        let currentDirectory = directory;

        // We've reached the top. Fail as invalid.
        if (currentDirectory === previousDirectory) {
            return null;
        }

        if (currentDirectory === '.' || currentDirectory === '') {
            currentDirectory = process.cwd();
        }

        if (!fs.existsSync(currentDirectory)) {
            return null;
        }

        // Search up until we find package.json
        // What if we find nothing?
        if (
            !fs.existsSync(path.join(currentDirectory, 'package.json')) &&
            !fs.existsSync(path.join(currentDirectory, 'sfdx-project.json'))
        ) {
            return this.resolveProjectDirectory(
                path.join(currentDirectory, '..'),
                currentDirectory
            );
        }

        return currentDirectory;
    }

    private initWithSfdxConfiguration() {
        const _path = this.directory;
        let jsonFileContents = null;
        const sfdxProjectPath = path.join(_path, 'sfdx-project.json');
        const packageDirectories: string[] = [];

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

            try {
                if (jsonFileContents !== null && jsonFileContents !== '') {
                    const configMap: any = JSON.parse(jsonFileContents);

                    if (configMap.packageDirectories instanceof Array) {
                        let defaultPackage: string = '';
                        configMap.packageDirectories.forEach(
                            (element: { default: boolean; path: string }) => {
                                if (element.default) {
                                    defaultPackage = element.path;
                                } else {
                                    packageDirectories.push(element.path);
                                }
                            }
                        );
                        if (defaultPackage) {
                            packageDirectories.unshift(defaultPackage);
                        }
                    }
                }
            } catch (e) {
                console.error(
                    `Loading configuration from ${sfdxProjectPath} failed with the error ${
                        e.message
                    }`
                );
            }
        }

        if (packageDirectories.length > 0) {
            if (!this.configuration.modulesSourceDirectory) {
                // The sfdx-project.json specifies where the modules are located.
                this.configuration.modulesSourceDirectory =
                    packageDirectories[0];
            }

            if (!this.configuration.staticResourcesDirectory) {
                // Figure out where the static resources are from the configuration as well.
                const resourcePath = path.join(
                    packageDirectories[0],
                    'main/default/staticresources'
                );
                this.configuration.staticResourcesDirectory = resourcePath;
            }
        }
    }
}

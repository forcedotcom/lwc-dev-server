import fs from 'fs-extra';
import path from 'path';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import SfdxProject from './SfdxProject';
import { SFDX_PROJECT_JSON } from '../server/Constants';

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
        this._isSFDX = SfdxProject.isSfdxProjectJsonPresent(this.rootDirectory);
        if (this._isSFDX) {
            new SfdxProject(
                this._configuration,
                this.rootDirectory
            ).initWithSfdxConfiguration();
        }
    }

    public get configuration(): LocalDevServerConfiguration {
        return this._configuration;
    }

    public get isSfdx(): boolean {
        return this._isSFDX;
    }

    public get modulesSourceDirectory(): string {
        var srcDir = path.isAbsolute(this.configuration.modulesSourceDirectory)
            ? this.configuration.modulesSourceDirectory
            : path.join(
                  this.rootDirectory,
                  this.configuration.modulesSourceDirectory || 'src'
              );
        if (!fs.existsSync(srcDir) || !fs.lstatSync(srcDir).isDirectory()) {
            console.warn(`modules source directory '${srcDir}' does not exist`);
        }
        return srcDir;
    }

    public get staticResourcesDirectories(): string[] {
        const staticResourceDirectoriesResults: string[] = [];
        if (!Array.isArray(this.configuration.staticResourcesDirectories)) {
            console.warn(
                'staticResourcesDirectories must be provided in a list format'
            );
            return staticResourceDirectoriesResults;
        }
        this.configuration.staticResourcesDirectories.forEach(
            staticResourceDirectory => {
                if (path.isAbsolute(staticResourceDirectory)) {
                    staticResourceDirectoriesResults.push(
                        staticResourceDirectory
                    );
                } else {
                    staticResourceDirectoriesResults.push(
                        path.join(this.rootDirectory, staticResourceDirectory)
                    );
                }
            }
        );
        return staticResourceDirectoriesResults;
    }

    public get customLabelsPath(): string | undefined {
        return this.getConfigurationPath(this.configuration.customLabelsFile);
    }

    /**
     * Sets the content assets path in the configuration if 1) explicitly set
     * in the configuration or 2) exists in an SFDX project. We will only warn
     * the user of the missing directory if they have set the configuration.
     */
    public get contentAssetsDirectory(): string | undefined {
        var dir = this.getConfigurationPath(
            this.configuration.contentAssetsDirectory
        );
        if (dir && (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory())) {
            console.warn(`content assets directory '${dir}' does not exist`);
            return undefined;
        }
        return dir;
    }

    /**
     * The Root directory of the Project.
     * Where the package.json or the root sfdx-project.json file is located.
     */
    public get directory(): string {
        return this.rootDirectory;
    }

    /**
     * Returns the port set in localdevserver.config.json file.
     * If no value set, returns the default port (3333).
     */
    public get port(): number {
        return this.configuration.port;
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
            !fs.existsSync(path.join(currentDirectory, SFDX_PROJECT_JSON))
        ) {
            return this.resolveProjectDirectory(
                path.join(currentDirectory, '..'),
                currentDirectory
            );
        }

        return currentDirectory;
    }

    private getConfigurationPath(config: string): string | undefined {
        if (path.isAbsolute(config)) {
            return config;
        }
        if (config !== '') {
            return path.join(this.rootDirectory, config);
        }
    }
}

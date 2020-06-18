import fs from 'fs-extra';
import path from 'path';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import { findFolders } from './fileUtils';

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
        const packageDirectories: string[] = this.getPackageDirectories();

        if (packageDirectories.length > 0) {
            const defaultPackageDirectory = packageDirectories[0];
            this.setModulesSourceDirectory(defaultPackageDirectory);
            this.setStaticResourcesDirectories(packageDirectories);
            this.setCustomLabelsFile(defaultPackageDirectory);
            this.setContentAssetsPath(defaultPackageDirectory);
        }
    }

    private getPackageDirectories(): string[] {
        const packageDirectories: string[] = [];
        const sfdxProjectPath = path.join(this.directory, 'sfdx-project.json');

        if (fs.existsSync(sfdxProjectPath)) {
            const jsonFileContents = this.getJsonFileContents(sfdxProjectPath);
            if (jsonFileContents && !!jsonFileContents.trim()) {
                try {
                    this.getPackagesFromMap(
                        JSON.parse(jsonFileContents),
                        packageDirectories
                    );
                } catch (e) {
                    console.error(
                        `Loading configuration from ${sfdxProjectPath} failed with the error ${e.message}`
                    );
                }
            }
        }
        return packageDirectories;
    }

    private getJsonFileContents(jsonPath: string): string | null {
        let jsonFileContents = null;
        try {
            jsonFileContents = fs.readFileSync(jsonPath, 'utf-8');
        } catch (e) {
            console.error(
                `Loading ${jsonPath} failed JSON parsing with error ${e.message}`
            );
        }
        return jsonFileContents;
    }

    private getPackagesFromMap(configMap: any, packageDirectories: string[]) {
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

    private setModulesSourceDirectory(defaultPackageDirectory: string) {
        if (!this.configuration.modulesSourceDirectory) {
            // The sfdx-project.json specifies where the modules are located.

            // WARNING: this is not the correct modules source dir (which
            // would be for example `force-app/main/default`) but a dir
            // several levels above (e.g., `force-app`).
            // This is because LWR doesn't allow more than one directory
            // to watch for changes, but we need to watch the entire
            // force-app dir for changes to other files such as static
            // resources. Once LWR fixes this then this should be changed.
            this.configuration.modulesSourceDirectory = defaultPackageDirectory;
        }
    }

    private setStaticResourcesDirectories(packageDirectories: string[]) {
        const foldersToIgnore = new Set([
            'aura',
            'lwc',
            'classes',
            'triggers',
            'layouts',
            'objects'
        ]);
        if (
            this.configuration.staticResourcesDirectories &&
            this.configuration.staticResourcesDirectories.length === 0
        ) {
            // Figure out where the static resources are located
            let resourcePaths: string[] = [];
            packageDirectories.forEach(item => {
                const staticResourceFolders = findFolders(
                    path.join(this.directory, item),
                    'staticresources',
                    [],
                    foldersToIgnore
                );
                const resourcePathIndex =
                    resourcePaths.length > 0 ? resourcePaths.length - 1 : 0;
                resourcePaths.splice(
                    resourcePathIndex,
                    0,
                    ...staticResourceFolders
                );
            });
            this.configuration.staticResourcesDirectories = resourcePaths;
        }
    }

    private setCustomLabelsFile(defaultPackageDirectory: string) {
        if (!this.configuration.customLabelsFile) {
            const labelsPath = path.join(
                defaultPackageDirectory,
                'main',
                'default',
                'labels',
                'CustomLabels.labels-meta.xml'
            );
            if (fs.existsSync(path.join(this.rootDirectory, labelsPath))) {
                this.configuration.customLabelsFile = labelsPath;
            }
        }
    }

    private setContentAssetsPath(defaultPackageDirectory: string) {
        if (!this.configuration.contentAssetsDirectory) {
            const contentAssetsPath = path.join(
                defaultPackageDirectory,
                'main',
                'default',
                'contentassets'
            );
            if (
                fs.existsSync(path.join(this.rootDirectory, contentAssetsPath))
            ) {
                // Only set the config if present. This prevents warning the user
                // of a configuration that they likely don't need or care about.
                this.configuration.contentAssetsDirectory = contentAssetsPath;
            }
        }
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

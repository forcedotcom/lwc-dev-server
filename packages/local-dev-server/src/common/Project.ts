import fs from 'fs';
import path from 'path';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import SfdxConfiguration from '../user/SfdxConfiguration';

export default class Project {
    /**
     * Would not be valid if you ran the command on a directory without a package.json file.
     */
    private isValidProject = false;
    private readonly isSfdxProject: boolean;
    private readonly rootDirectory: string;
    private readonly _modulesSourceDirectory: string | null;
    private readonly sfdxConfiguration: SfdxConfiguration;
    private readonly configuration: LocalDevServerConfiguration;

    constructor(directory: string) {
        // Directory could be either the project, or a folder in a project.
        // Resolve to find the right folder.
        this.rootDirectory = this.resolveProjectDirectory(directory);

        // Base configuration for the project.
        // Also merges the config at localdevserver.config.json as well
        const configurationPath = path.join(
            this.rootDirectory,
            'localdevserver.config.json'
        );
        this.configuration = new LocalDevServerConfiguration(configurationPath);

        // Resolve the sfdx-project.json file at the root of the project.
        // If there is no configuration file, assume we aren't in that project structure.
        const sfdxConfigurationFileLocation = path.join(
            this.rootDirectory,
            'sfdx-project.json'
        );
        this.sfdxConfiguration = new SfdxConfiguration(
            sfdxConfigurationFileLocation
        );
        this.isSfdxProject = this.sfdxConfiguration.hasConfigurationFile();

        // Must be after isSfdx setting
        this._modulesSourceDirectory = this.isValid()
            ? this.resolveModulesSourceDirectory()
            : null;
    }

    public getConfiguration(): LocalDevServerConfiguration {
        return this.configuration;
    }

    public isValid() {
        return this.isValidProject;
    }

    public isSfdx() {
        return this.isSfdxProject;
    }

    public getDirectory(): string {
        return this.rootDirectory;
    }

    public getModuleSourceDirectory(): string | null {
        return this._modulesSourceDirectory;
    }

    // Look Up and down for package.json
    // Feels like a Project data structure here.
    private resolveProjectDirectory(directory: string): string {
        let currentDirectory = directory;

        if (currentDirectory === this.rootDirectory) {
            return this.rootDirectory;
        }

        if (currentDirectory === '.' || currentDirectory === '') {
            currentDirectory = process.cwd();
        }

        if (!fs.existsSync(currentDirectory)) {
            console.error(`directory did not exist: ${currentDirectory}`);
            this.isValidProject = false;
            return currentDirectory;
        }

        // Search up until we find package.json
        // What if we find nothing?
        if (!fs.existsSync(path.join(currentDirectory, 'package.json'))) {
            return this.resolveProjectDirectory(
                path.join(currentDirectory, '..')
            );
        }

        this.isValidProject = true;
        return currentDirectory;
    }

    private resolveModulesSourceDirectory(): string {
        // Try to get the value from the configuration file
        const dirFromConfig = this.configuration.getModuleSourceDirectory();
        if (dirFromConfig !== null || dirFromConfig !== '') {
            return dirFromConfig;
        }

        // If SFDX, we should know the path.
        if (this.isSfdx()) {
            // TODO: Support more than one package
            const packageDirectories = this.sfdxConfiguration.getPackageDirectories();
            if (packageDirectories.length > 0) {
                return `${packageDirectories[0]}/main/default/lwc`;
            }

            // What would we expect if no value is specified?
            return '';
        }

        // If Not, we should assume src for now.
        return `${this.rootDirectory}/src`;
    }
}

import fs from 'fs-extra';
import path from 'path';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import SfdxConfiguration from '../user/SfdxConfiguration';
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
    private _modulesSourceDirectory: string | null = null;
    private _staticResourcesDirectory: string | null = null;
    private _sfdxConfiguration: SfdxConfiguration;

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

        // Resolve the default SfdxConfiguration
        this._sfdxConfiguration = new SfdxConfiguration(this);

        // Use detection of the sfdx-project configuration to detect if this is an Sfdx Project and we should
        // treat it as such.
        this._isSFDX = fs.existsSync(
            path.join(this.rootDirectory, 'sfdx-project.json')
        );

        // Must be after isSfdx setting
        this._modulesSourceDirectory = this.resolveModulesSourceDirectory();
    }

    private initWithSfdxConfiguration() {
        // The SfdxConfiguration will specify where the modules are located.
        this._modulesSourceDirectory = this.getSfdxProjectLWCDirectory(
            this.rootDirectory
        );
        // Figure out where the static resources are from the configuration as well.
        this._staticResourcesDirectory = this.getSfdxProjectStaticResourcesDirectory();

        // Merge the configuration values from Sfdx over the default configuration.
        this.configuration.port = this.sfdxConfiguration.port;
        this.configuration.namespace = this.sfdxConfiguration.namespace;
    }

    public get configuration(): LocalDevServerConfiguration {
        return this._configuration;
    }

    public get isSfdx(): boolean {
        return this._isSFDX;
    }

    public get sfdxConfiguration(): SfdxConfiguration {
        return this._sfdxConfiguration;
    }

    public set sfdxConfiguration(sfdxConfiguration: SfdxConfiguration) {
        this._sfdxConfiguration = sfdxConfiguration;
        this.initWithSfdxConfiguration();
    }

    public get modulesSourceDirectory(): string | null {
        return this._modulesSourceDirectory;
    }

    public get staticResourcesDirectory(): string | null {
        return this._staticResourcesDirectory;
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

    private resolveModulesSourceDirectory(): string {
        // Try to get the value from the configuration file
        let dirFromConfig =
            this.configuration && this.configuration.getModuleSourceDirectory();
        if (dirFromConfig !== null && dirFromConfig !== '') {
            if (!path.isAbsolute(dirFromConfig)) {
                dirFromConfig = path.join(this.rootDirectory, dirFromConfig);
            }
            return dirFromConfig;
        }

        // If SFDX, we should know the path.
        if (this.isSfdx) {
            return this.getSfdxProjectLWCDirectory(this.rootDirectory);
        }

        // If Not, we should assume src for now.
        return path.join(this.rootDirectory, 'src');
    }

    private getSfdxProjectLWCDirectory(rootDirectory: string): string {
        // TODO: Support more than one package
        const packageDirectories = this.sfdxConfiguration.getPackageDirectories();
        if (packageDirectories.length > 0) {
            return path.join(rootDirectory, packageDirectories[0]);
        }

        // What would we expect if no value is specified?
        return '.';
    }

    private getSfdxProjectStaticResourcesDirectory(): string | null {
        // TODO: Support more than one package
        const packageDirectories = this.sfdxConfiguration.getPackageDirectories();
        if (packageDirectories.length > 0) {
            const resourcePath = path.join(
                packageDirectories[0],
                'main/default/staticresources'
            );

            return path.join(this.rootDirectory, resourcePath);
        }

        // What would we expect if no value is specified?
        return null;
    }
}

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
    private rootDirectory: string = '';
    private modulesSourceDirectory: string | null = null;
    private sfdxConfiguration: SfdxConfiguration;
    private configuration: LocalDevServerConfiguration;
    private isSFDX: boolean = false;
    private staticResourcesDirectory: string | null = null;

    constructor(directory: string, sfdxConfiguration?: SfdxConfiguration) {
        // Directory could be either the project, or a folder in a project.
        // Resolve to find the right folder.
        const rootDirectory = this.resolveProjectDirectory(directory);

        if (rootDirectory === null) {
            throw new Error(
                `Directory specified '${directory}' does not resolve to a project. The specified directory must have package.json in it.`
            );
        }

        this.rootDirectory = rootDirectory;

        // Base configuration for the project.
        // Also merges the config at localdevserver.config.json as well
        const configurationPath = path.join(
            this.rootDirectory,
            'localdevserver.config.json'
        );
        this.configuration = new LocalDevServerConfiguration(configurationPath);

        if (sfdxConfiguration === undefined) {
            // Resolve the default SfdxConfiguration
            this.sfdxConfiguration = new SfdxConfiguration(this);
        } else {
            this.sfdxConfiguration = sfdxConfiguration;

            // Merge in the Sfdx Configuration values.
            this.initWithSfdxConfiguration();
        }

        // Must be after isSfdx setting
        this.modulesSourceDirectory = this.resolveModulesSourceDirectory();

        // Use detection of the sfdx-project configuration to detect if this is an Sfdx Project and we should
        // treat it as such.
        this.isSFDX = fs.existsSync(
            path.join(this.rootDirectory, 'sfdx-project.json')
        );
    }

    private initWithSfdxConfiguration() {
        if (this.sfdxConfiguration === undefined) {
            return;
        }

        // The SfdxConfiguration will specify where the modules are located.
        this.modulesSourceDirectory = this.getSfdxProjectLWCDirectory(
            this.rootDirectory
        );
        // Figure out where the static resources are from the configuration as well.
        this.staticResourcesDirectory = this.getSfdxProjectStaticResourcesDirectory();

        // Merge the configuration values from Sfdx over the default configuration.
        this.configuration.port = this.sfdxConfiguration.port;
        this.configuration.namespace = this.sfdxConfiguration.namespace;
    }

    public getConfiguration(): LocalDevServerConfiguration {
        return this.configuration;
    }

    public isSfdx(): Boolean {
        return this.isSFDX;
    }

    public getSfdxConfiguration(): SfdxConfiguration {
        return this.sfdxConfiguration;
    }

    public setSfdxConfiguration(sfdxConfiguration: SfdxConfiguration) {
        this.sfdxConfiguration = sfdxConfiguration;

        this.initWithSfdxConfiguration();
    }

    public getModuleSourceDirectory(): string | null {
        return this.modulesSourceDirectory;
    }

    public getStaticResourcesDirectory(): string | null {
        return this.staticResourcesDirectory;
    }

    public getDirectory(): string {
        return this.rootDirectory || '.';
    }

    // Look for package.json or go up directories until found
    // Feels like a Project data structure here.
    private resolveProjectDirectory(
        directory: string,
        previousDirectory?: string
    ): string | null {
        let currentDirectory = directory;

        // We've reached the top. Fail as invalid.
        if (currentDirectory === previousDirectory) {
            return null;
        }

        if (currentDirectory && currentDirectory === this.rootDirectory) {
            if (!fs.existsSync(path.join(currentDirectory, 'package.json'))) {
                return null;
            }
            return this.rootDirectory;
        }

        if (currentDirectory === '.' || currentDirectory === '') {
            currentDirectory = process.cwd();
        }

        if (!fs.existsSync(currentDirectory)) {
            return null;
        }

        // Search up until we find package.json
        // What if we find nothing?
        if (!fs.existsSync(path.join(currentDirectory, 'package.json'))) {
            return this.resolveProjectDirectory(
                path.join(currentDirectory, '..'),
                currentDirectory
            );
        }

        return currentDirectory;
    }

    private resolveModulesSourceDirectory(): string {
        const rootDirectory = this.rootDirectory || '.';
        // Try to get the value from the configuration file
        let dirFromConfig =
            this.configuration && this.configuration.getModuleSourceDirectory();
        if (dirFromConfig !== null && dirFromConfig !== '') {
            if (!path.isAbsolute(dirFromConfig)) {
                dirFromConfig = path.join(rootDirectory, dirFromConfig);
            }
            return dirFromConfig;
        }

        // If SFDX, we should know the path.
        if (this.isSfdx()) {
            return this.getSfdxProjectLWCDirectory(rootDirectory);
        }

        // If Not, we should assume src for now.
        return path.join(rootDirectory, 'src');
    }

    private getSfdxProjectLWCDirectory(rootDirectory = '.'): string {
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
            if (this.rootDirectory) {
                return path.join(this.rootDirectory, resourcePath);
            }
            return resourcePath;
        }

        // What would we expect if no value is specified?
        return null;
    }
}

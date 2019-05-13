import fs from 'fs-extra';
import path from 'path';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import SfdxConfiguration from '../user/SfdxConfiguration';
import { SfdxProject } from '@salesforce/core';

export default class Project {
    /**
     * Would not be valid if you ran the command on a directory without a package.json file.
     */
    private rootDirectory: string | null = null;
    private modulesSourceDirectory: string | null = null;
    private sfdxConfiguration: SfdxConfiguration = new SfdxConfiguration('.');
    private configuration: LocalDevServerConfiguration;
    private isSFDX: boolean = false;
    private staticResourcesDirectory: string | null = null;

    constructor(object?: string | SfdxConfiguration) {
        this.configuration = new LocalDevServerConfiguration();
        if (object instanceof SfdxConfiguration) {
            this.initWithSfdxConfiguration(object);
        } else {
            this.initWithDirectory(object || '.');
        }
        this.isSFDX = fs.existsSync(
            path.join(this.sfdxConfiguration.getPath(), 'sfdx-project.json')
        );
    }

    private initWithDirectory(directory: string) {
        // Directory could be either the project, or a folder in a project.
        // Resolve to find the right folder.
        this.rootDirectory = this.resolveProjectDirectory(directory);

        if (this.rootDirectory != null) {
            // Base configuration for the project.
            // Also merges the config at localdevserver.config.json as well
            const configurationPath = path.join(
                this.rootDirectory,
                'localdevserver.config.json'
            );
            this.configuration = new LocalDevServerConfiguration(
                configurationPath
            );

            // Resolve the sfdx-project.json file at the root of the project.
            // If there is no configuration file, assume we aren't in that project structure.
            this.sfdxConfiguration = new SfdxConfiguration(this.rootDirectory);

            // Must be after isSfdx setting
            this.modulesSourceDirectory = this.resolveModulesSourceDirectory();
        } else {
            this.modulesSourceDirectory = null;
        }
    }

    private initWithSfdxConfiguration(sfdxConfiguration: SfdxConfiguration) {
        this.sfdxConfiguration = sfdxConfiguration;
        this.rootDirectory = sfdxConfiguration.getPath();
        this.modulesSourceDirectory = this.getSfdxProjectLWCDirectory(
            this.rootDirectory
        );
        this.staticResourcesDirectory = this.getSfdxProjectStaticResourcesDirectory();
        this.configuration.port = sfdxConfiguration.port;
        this.configuration.namespace = sfdxConfiguration.namespace;
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

        if (currentDirectory === this.rootDirectory) {
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
            return `${packageDirectories[0]}/main/default/staticresources`;
        }

        // What would we expect if no value is specified?
        return null;
    }
}

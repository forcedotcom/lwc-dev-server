import fs from 'fs';
import path from 'path';

export default class Project {
    private _isValid = false;
    private readonly _isSfdx: boolean;
    private readonly _directory: string;
    private readonly _modulesSourceDirectory: string;

    constructor(directory: string) {
        // Directory could be either the project, or a folder in a project.
        // Resolve to find the right folder.
        this._directory = this.resolveProjectDirectory(directory);
        this._isSfdx = fs.existsSync(
            path.join(this._directory, 'sfdx-project.json')
        );

        // Must be after isSfdx setting
        this._modulesSourceDirectory = this.resolveModulesSourceDirectory(
            directory
        );
    }

    public isValid() {
        return this._isValid;
    }

    public isSfdx() {
        return this._isSfdx;
    }

    public getDirectory(): string {
        return this._directory;
    }

    public getModuleSourceDirectory(): string {
        return this._modulesSourceDirectory;
    }

    // Look Up and down for package.json
    // Feels like a Project data structure here.
    private resolveProjectDirectory(directory: string): string {
        let currentDirectory = directory;

        if (currentDirectory === this._directory) {
            return this._directory;
        }

        if (currentDirectory === '.' || currentDirectory === '') {
            currentDirectory = process.cwd();
        }

        if (!fs.existsSync(currentDirectory)) {
            console.error(`directory did not exist: ${currentDirectory}`);
            this._isValid = false;
            return currentDirectory;
        }

        // Search up until we find package.json
        // What if we find nothing?
        if (!fs.existsSync(path.join(currentDirectory, 'package.json'))) {
            return this.resolveProjectDirectory(
                path.join(currentDirectory, '..')
            );
        }

        this._isValid = true;
        return currentDirectory;
    }

    private resolveModulesSourceDirectory(directory: string): string {
        const projectDirectory = this.resolveProjectDirectory(directory);

        // If SFDX, we should know the path.
        if (this.isSfdx()) {
            // force-app is configurable, need to read that from sfdx-project.json
            return 'force-app/main/default/lwc';
        }

        // If Not, we should assume src for now.
        return `${projectDirectory}/src`;
    }
}

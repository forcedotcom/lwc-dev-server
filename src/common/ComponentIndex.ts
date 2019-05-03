import fs from 'fs-extra';
import path from 'path';
import Project from './Project';

export default class ComponentIndex {
    private project: Project;

    constructor(project: Project) {
        this.project = project;
    }

    public getModules(): string[] {
        const temp = this.project.getModuleSourceDirectory();
        if (temp !== null) {
            return this.findModulesIn(temp + 'todo/');
        }
        return [];
    }

    /**
     * @return list of .js modules inside namespaceRoot folder
     */
    private findModulesIn(namespaceRoot: string): string[] {
        const files: string[] = [];
        const subdirs = this.findSubdirectories(namespaceRoot);
        for (const subdir of subdirs) {
            console.log('test');
            const basename = path.basename(subdir);
            const modulePath = path.join(subdir, basename + '.js');
            if (
                fs.pathExistsSync(modulePath) &&
                this.isJSComponent(modulePath)
            ) {
                // TODO: check contents for: from 'lwc'?
                files.push(modulePath);
            }
        }
        return files;
    }

    private findSubdirectories(dir: string): string[] {
        const subdirs: string[] = [];
        const dirs = fs.readdirSync(dir);
        for (const file of dirs) {
            const subdir = path.join(dir, file);
            if (fs.statSync(subdir).isDirectory()) {
                subdirs.push(subdir);
            }
        }
        return subdirs;
    }

    /**
     * @return true if file is the main .js file for a component
     */
    private isJSComponent(file: string): boolean {
        if (!file.toLowerCase().endsWith('.js')) {
            return false;
        }
        return this.nameFromFile(file) != null;
    }

    private nameFromFile(file: string) {
        const filePath = path.parse(file);
        const fileName = filePath.name;
        const pathElements = this.splitPath(filePath);
        const parentDirName = pathElements.pop();
        if (fileName === parentDirName) {
            const namespace = pathElements.pop();
            return namespace + '/' + parentDirName;
        }
        return null;
    }

    // TODO investigate more why this happens
    private splitPath(filePath: path.ParsedPath): string[] {
        let pathElements = filePath.dir.split(path.sep);
        // Somehow on windows paths are occassionally using forward slash
        if (path.sep === '\\' && filePath.dir.indexOf('\\') === -1) {
            pathElements = filePath.dir.split('/');
        }
        return pathElements;
    }
}

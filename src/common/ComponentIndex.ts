import fs from 'fs-extra';
import path from 'path';
import Project from './Project';

export default class ComponentIndex {
    private project: Project;

    constructor(project: Project) {
        this.project = project;
    }

    public getModules(): object[] {
        let temp = this.project.modulesSourceDirectory;
        if (temp !== null) {
            if (this.project.isSfdx) {
                temp = path.join(temp, 'main/default/lwc');
            }
            return this.findModulesIn(temp);
        }
        return [];
    }

    /**
     * @return list of .js modules inside namespaceRoot folder
     */
    private findModulesIn(namespaceRoot: string): object[] {
        const files: object[] = [];
        const subdirs = this.findSubdirectories(namespaceRoot);
        for (const subdir of subdirs) {
            const basename = path.basename(subdir);
            const modulePath = path.join(subdir, basename + '.js');
            if (
                fs.pathExistsSync(modulePath) &&
                this.isJSComponent(modulePath) &&
                this.isUIComponent(modulePath)
            ) {
                const componentName = basename;
                let namespace = path.basename(path.dirname(subdir));
                if (this.project.isSfdx) {
                    namespace = this.project.configuration.namespace;
                }
                // TODO don't hardcode lwc/preview
                const cmpUrl =
                    '/lwc/preview/' + namespace + '/' + componentName;
                const cmpTitle = namespace + '-' + componentName;
                // TODO: check contents for: from 'lwc'?
                files.push({
                    url: cmpUrl,
                    title: cmpTitle
                });
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

    /**
     * @return true if file content contains 'LightningElement'
     */
    private isUIComponent(file: string): boolean {
        const fileContent = fs.readFileSync(file);
        if (fileContent.indexOf('LightningElement') > -1) {
            return true;
        }
        return false;
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

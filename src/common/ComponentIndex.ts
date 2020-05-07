import fs from 'fs-extra';
import path from 'path';
import Project from './Project';
import decamelize from 'decamelize';

// TODO clean this up
export default class ComponentIndex {
    private project: Project;

    constructor(project: Project) {
        this.project = project;
    }

    public getProjectMetadata(): ProjectMetadata {
        const metadata = this.findProjectMetadata();

        if (metadata.packages.length > 0) {
            const componentsMetadata = this.getModules();
            metadata.packages[0].components = componentsMetadata;
        }

        return metadata;
    }

    public getModules(): PackageComponent[] {
        let modulesSourceDirectory = this.project.modulesSourceDirectory;
        const moduleDirectories: string[] = [];
        if (this.project.isSfdx) {
            moduleDirectories.push(
                path.join(
                    this.project.modulesSourceDirectory,
                    'main/default/lwc'
                )
            );
        } else {
            moduleDirectories.push(
                ...this.findSubdirectories(this.project.modulesSourceDirectory)
            );
        }
        return this.findModulesIn(moduleDirectories);
    }

    /**
     * @return list of .js modules inside namespaceRoot folder
     */
    private findModulesIn(namespaceRoots: string[]): PackageComponent[] {
        const files: PackageComponent[] = [];
        namespaceRoots.forEach(namespaceRoot => {
            const subdirs = this.findSubdirectories(namespaceRoot);
            for (const subdir of subdirs) {
                const basename = path.basename(subdir);
                const modulePath = path.join(subdir, basename + '.js');
                if (
                    fs.pathExistsSync(modulePath) &&
                    this.isJSComponent(modulePath) &&
                    this.isUIComponent(modulePath)
                ) {
                    const name = basename;
                    let namespace = path.basename(path.dirname(subdir));
                    if (this.project.isSfdx) {
                        namespace = this.project.configuration.namespace;
                    }

                    const jsName = `${namespace}/${name}`;
                    const decamelizedName = decamelize(name, '-');
                    const htmlName = `${namespace}-${decamelizedName}`;
                    const url = `/preview/${namespace}/${name}`;

                    files.push({
                        jsName,
                        htmlName,
                        namespace,
                        name,
                        url,
                        path: path.normalize(modulePath)
                    });
                }
            }
        });
        return files;
    }

    private findSubdirectories(dir: string): string[] {
        const subdirs: string[] = [];
        if (!fs.existsSync(dir)) {
            return subdirs;
        }
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
        // TODO find a more robust way to do this
        try {
            const fileContent = fs.readFileSync(file);
            return fileContent.indexOf('LightningElement') > -1;
        } catch (e) {
            return true;
        }
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

    // TODO: clean this up and consolidate with Project.ts
    private findProjectMetadata(): ProjectMetadata {
        const root = this.project.directory;
        let projectName = path.basename(root);

        const packageJsonPath = path.join(root, 'package.json');
        try {
            const packageJson = JSON.parse(
                fs.readFileSync(packageJsonPath, 'utf8')
            );
            if (packageJson.name) {
                projectName = packageJson.name;
            }
        } catch (e) {
            console.error(
                `Loading ${packageJsonPath} failed JSON parsing with error ${e.message}`
            );
        }

        const packages: PackageMetadata[] = [];
        const metadata: ProjectMetadata = {
            projectName,
            packages
        };

        let defaultPackageName = 'Default';

        if (this.project.isSfdx) {
            const sfdxProjectPath = path.join(root, 'sfdx-project.json');
            if (fs.existsSync(sfdxProjectPath)) {
                try {
                    const sfdxJson = JSON.parse(
                        fs.readFileSync(sfdxProjectPath, 'utf8')
                    );
                    if (sfdxJson.packageDirectories instanceof Array) {
                        let sfdxDefaultPackage: any;
                        if (sfdxJson.packageDirectories.length === 1) {
                            sfdxDefaultPackage = sfdxJson.packageDirectories[0];
                        } else {
                            sfdxDefaultPackage = sfdxJson.packageDirectories.find(
                                (pkg: any) => !!pkg.default
                            );
                        }
                        if (sfdxDefaultPackage) {
                            if (sfdxDefaultPackage.package) {
                                defaultPackageName = sfdxDefaultPackage.package;
                            } else if (sfdxDefaultPackage.path) {
                                defaultPackageName = path.basename(
                                    sfdxDefaultPackage.path
                                );
                            }
                        }
                    }
                } catch (e) {
                    console.error(
                        `Loading ${sfdxProjectPath} failed JSON parsing with error ${e.message}`
                    );
                }
            }
        }

        const defaultPackage = {
            key: 'package_1',
            packageName: defaultPackageName,
            components: [],
            isDefault: true
        };
        packages.push(defaultPackage);
        return metadata;
    }
}

export interface ProjectMetadata {
    projectName: string;
    packages: PackageMetadata[];
}

export interface PackageMetadata {
    /** unique project identifier-- TODO: are package names guaranteed unique? */
    key: string;
    isDefault: boolean;
    packageName: string;
    components: PackageComponent[];
}

export interface PackageComponent {
    htmlName: string;
    jsName: string;
    name: string;
    namespace: string;
    url: string;
    path: string;
}

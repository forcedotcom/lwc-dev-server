import LocalDevServerConfiguration from 'user/LocalDevServerConfiguration';
import fs from 'fs-extra';
import path from 'path';
import {
    findFolders,
    getFileContents,
    findFileWithDefaultPath,
    findFolderWithDefaultPath
} from './fileUtils';
import {
    SFDX_PROJECT_JSON,
    CONTENT_ASSETS,
    STATIC_RESOURCES,
    DEFAULT_SFDX_PATH
} from '../server/Constants';

export default class SfdxProject {
    private configuration: LocalDevServerConfiguration;
    private projectDir: string;
    private sfdxProjectPath: string;
    private _isSfdxProject: boolean;

    private static readonly FOLDERS_TO_IGNORE = new Set([
        'aura',
        'lwc',
        'classes',
        'triggers',
        'layouts',
        'objects'
    ]);
    private static readonly CUSTOM_LABELS_FOLDER = 'labels';
    private static readonly CUSTOM_LABELS_FILE = 'CustomLabels.labels-meta.xml';

    constructor(config: LocalDevServerConfiguration, projectDir: string) {
        this.configuration = config;
        this.projectDir = projectDir;
        this.sfdxProjectPath = path.join(projectDir, SFDX_PROJECT_JSON);
        this._isSfdxProject = fs.existsSync(this.sfdxProjectPath);
    }

    public get isSfdxProject() {
        return this._isSfdxProject;
    }

    public initWithSfdxConfiguration() {
        if (this._isSfdxProject) {
            const packageDirectories: string[] = this.getPackageDirectories();
            if (packageDirectories.length > 0) {
                const defaultPackageDirectory = packageDirectories[0];
                this.setModulesSourceDirectory(defaultPackageDirectory);
                this.setStaticResourcesDirectories(packageDirectories);
                this.setCustomLabelsFile(defaultPackageDirectory);
                this.setContentAssetsPath(defaultPackageDirectory);
            }
        }
    }

    private getPackageDirectories(): string[] {
        const packageDirectories: string[] = [];
        const jsonContents = getFileContents(this.sfdxProjectPath);
        if (jsonContents && !!jsonContents.trim()) {
            try {
                this.getPackagesFromMap(
                    JSON.parse(jsonContents),
                    packageDirectories
                );
            } catch (e) {
                console.error(
                    `Loading configuration from ${this.sfdxProjectPath} failed with the error ${e.message}`
                );
            }
        }
        return packageDirectories;
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
        if (
            this.configuration.staticResourcesDirectories &&
            this.configuration.staticResourcesDirectories.length === 0
        ) {
            // Figure out where the static resources are located
            let resourcePaths: string[] = [];
            packageDirectories.forEach(item => {
                const staticResourceFolders = findFolders(
                    path.join(this.projectDir, item),
                    STATIC_RESOURCES,
                    [],
                    SfdxProject.FOLDERS_TO_IGNORE
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
            this.configuration.customLabelsFile = findFileWithDefaultPath(
                path.join(this.projectDir, defaultPackageDirectory),
                DEFAULT_SFDX_PATH,
                SfdxProject.CUSTOM_LABELS_FOLDER,
                SfdxProject.CUSTOM_LABELS_FILE
            );
        }
    }

    private setContentAssetsPath(defaultPackageDirectory: string) {
        if (!this.configuration.contentAssetsDirectory) {
            this.configuration.contentAssetsDirectory = findFolderWithDefaultPath(
                path.join(this.projectDir, defaultPackageDirectory),
                DEFAULT_SFDX_PATH,
                CONTENT_ASSETS,
                SfdxProject.FOLDERS_TO_IGNORE
            );
        }
    }
}

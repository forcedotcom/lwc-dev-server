/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import LocalDevServerConfiguration from './LocalDevServerConfiguration';
import {
    CONTENT_ASSETS,
    DEFAULT_SFDX_PATH,
    SFDX_PROJECT_JSON,
    STATIC_RESOURCES
} from './Constants';
import {
    findAllFolderPaths,
    findFileWithDefaultPath,
    getAbsolutePath,
    getFileContents
} from './fileUtils';
import { ServerConfiguration } from './types';

export type ProjectConfiguration = {
    modulesSourceDirectory: string;
    staticResourcesDirectories: string[];
    customLabels: string;
    contentAssetsDirectories: string[];
};

const FOLDERS_TO_IGNORE = new Set([
    'aura',
    'lwc',
    'classes',
    'triggers',
    'layouts',
    'objects'
]);
const CUSTOM_LABELS_FOLDER = 'labels';
const CUSTOM_LABELS_FILE = 'CustomLabels.labels-meta.xml';

export default class Project {
    private readonly projectRootDirectory: string;
    private projectConfiguration = {} as ProjectConfiguration;
    private readonly serverRootDirectory: string;
    private readonly serverConfiguration: LocalDevServerConfiguration;

    constructor(directory: string, serverConfiguration: ServerConfiguration) {
        if (directory === null || !this.isSfdxProjectJsonPresent(directory)) {
            throw new Error(
                `Directory specified '${directory}' does not resolve to a valid Salesforce DX project. ` +
                    `More information about this at https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm`
            );
        }

        this.projectRootDirectory = directory;
        this.serverRootDirectory = path.join(__dirname, '..', '..');
        this.serverConfiguration = new LocalDevServerConfiguration(
            serverConfiguration
        );
        const packageDirectories: string[] = this.getPackageDirectories();
        if (packageDirectories.length <= 0) {
            throw new Error(
                'No packageDirectories found on sfdx-project.json. ' +
                    'More information about this at https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm'
            );
        }

        const defaultPackageDirectory = path.join(
            this.projectRootDirectory,
            packageDirectories[0]
        );
        this.setModulesSourceDirectory(defaultPackageDirectory);
        this.setStaticResourcesDirectories(packageDirectories);
        this.setCustomLabelsFile(defaultPackageDirectory);
        this.setContentAssetsDirectories(packageDirectories);
    }

    public get configuration(): LocalDevServerConfiguration {
        return this.serverConfiguration;
    }

    /**
     * The root directory of the Salesforce DX project that will be previewed
     */
    public get projectDirectory(): string {
        return this.projectRootDirectory;
    }

    /**
     * The root directory for the local dev server.
     */
    public get serverDirectory(): string {
        return this.serverRootDirectory;
    }

    /**
     * If no value set, returns the default port (3333).
     */
    public get port(): number {
        return this.configuration.port;
    }

    public isSfdxProjectJsonPresent(rootDirectory: string): boolean {
        return fs.existsSync(path.join(rootDirectory, SFDX_PROJECT_JSON));
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

    // Note: we should look at replacing this with @salesforce/core SfdxProject class
    // https://forcedotcom.github.io/sfdx-core/classes/sfdxproject.html#getdefaultpackage
    public getPackageDirectories(): string[] {
        const packageDirectories: string[] = [];
        const sfdxProjectJsonPath = path.join(
            this.projectRootDirectory,
            SFDX_PROJECT_JSON
        );
        const jsonContents = getFileContents(sfdxProjectJsonPath);
        if (jsonContents && !!jsonContents.trim()) {
            try {
                this.getPackagesFromMap(
                    JSON.parse(jsonContents),
                    packageDirectories
                );
            } catch (e) {
                console.error(
                    `Loading configuration from ${sfdxProjectJsonPath} failed with the error ${e.message}`
                );
            }
        }
        return packageDirectories;
    }

    private setModulesSourceDirectory(defaultPackageDirectory: string) {
        // The sfdx-project.json specifies where the modules are located.

        // WARNING: this is not the correct modules source dir (which
        // would be for example `force-app/main/default`) but a dir
        // several levels above (e.g., `force-app`).
        // This is because LWR doesn't allow more than one directory
        // to watch for changes, but we need to watch the entire
        // force-app dir for changes to other files such as static
        // resources. Once LWR fixes this then this should be changed.
        this.projectConfiguration.modulesSourceDirectory = defaultPackageDirectory;
    }

    public get modulesSourceDirectory(): string {
        const srcDir = getAbsolutePath(
            this.projectConfiguration.modulesSourceDirectory
        );
        if (!fs.existsSync(srcDir) || !fs.lstatSync(srcDir).isDirectory()) {
            console.warn(`modules source directory '${srcDir}' does not exist`);
        }
        return srcDir;
    }

    private setStaticResourcesDirectories(packageDirectories: string[]) {
        this.projectConfiguration.staticResourcesDirectories = findAllFolderPaths(
            this.projectRootDirectory,
            packageDirectories,
            STATIC_RESOURCES,
            FOLDERS_TO_IGNORE
        );
    }

    public get staticResourcesDirectories(): string[] {
        const staticResourceDirectoriesResults: string[] = [];
        if (
            !Array.isArray(this.projectConfiguration.staticResourcesDirectories)
        ) {
            console.warn(
                'staticResourcesDirectories must be provided in a list format'
            );
            return staticResourceDirectoriesResults;
        }
        this.projectConfiguration.staticResourcesDirectories.forEach(
            staticResourceDirectory => {
                staticResourceDirectoriesResults.push(
                    getAbsolutePath(staticResourceDirectory)
                );
            }
        );
        return staticResourceDirectoriesResults;
    }

    private setCustomLabelsFile(defaultPackageDirectory: string) {
        this.projectConfiguration.customLabels = findFileWithDefaultPath(
            defaultPackageDirectory,
            DEFAULT_SFDX_PATH,
            CUSTOM_LABELS_FOLDER,
            CUSTOM_LABELS_FILE,
            FOLDERS_TO_IGNORE
        );
    }

    public get customLabelsPath(): string | undefined {
        if (!this.projectConfiguration.customLabels) {
            return undefined;
        }
        const customLabelsFile = getAbsolutePath(
            this.projectConfiguration.customLabels
        );

        if (
            !fs.existsSync(customLabelsFile) ||
            !fs.lstatSync(customLabelsFile).isDirectory()
        ) {
            console.warn(`Custom labels '${customLabelsFile}' were not found`);
        }
        return customLabelsFile;
    }

    private setContentAssetsDirectories(packageDirectories: string[]) {
        this.projectConfiguration.contentAssetsDirectories = findAllFolderPaths(
            this.projectRootDirectory,
            packageDirectories,
            CONTENT_ASSETS,
            FOLDERS_TO_IGNORE
        );
    }

    public get contentAssetsDirectories(): string[] {
        const contentAssetsDirectoriesResults: string[] = [];
        if (
            !Array.isArray(this.projectConfiguration.contentAssetsDirectories)
        ) {
            console.warn(
                'contentAssetsDirectories must be provided in a list format'
            );
            return contentAssetsDirectoriesResults;
        }
        this.projectConfiguration.contentAssetsDirectories.forEach(
            contentAssetDirectory => {
                contentAssetsDirectoriesResults.push(
                    getAbsolutePath(contentAssetDirectory)
                );
            }
        );

        return contentAssetsDirectoriesResults;
    }
}

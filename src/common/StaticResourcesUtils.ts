/*
 * Utility for ensuring static resources are copied correctly.
 */

import path from 'path';
import { copyFiles } from '../common/fileUtils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from './Constants';
import WebruntimeConfig from '../server/config/WebruntimeConfig';
import Project from './Project';

/**
 * Copy app static resources.
 */
export function copyStaticAssets(project: Project, config: WebruntimeConfig) {
    // TODO
    // Consider moving these into a project config as well to ensure consistency?
    // We don't want to have someone pass free form text to any of these methods.
    const serverAssetsPath = path.join(config.buildDir, 'assets');
    const staticAssetsPath = path.join(serverAssetsPath, 'project');

    copyDistAssets(serverAssetsPath, project);
    copyStaticResources(staticAssetsPath, project);
    copyContentAssets(staticAssetsPath, project);
}

export function copyDistAssets(serverAssetsPath: string, project: Project) {
    const distAssetsPath = path.join(project.serverDirectory, 'dist', 'assets');
    try {
        const localDevAssetsPath = path.join(serverAssetsPath, 'localdev');
        copyFiles(path.join(distAssetsPath, '*'), localDevAssetsPath);
    } catch (e) {
        throw new Error(`Unable to copy dist assets: ${e.message || e}`);
    }
}

export function copyStaticResources(
    staticAssetsPath: string,
    project: Project
) {
    const staticResources = project.staticResourcesDirectories;
    try {
        if (staticResources && staticResources.length > 0) {
            staticResources.forEach((item: string) => {
                copyFiles(
                    path.join(item, '*'),
                    path.join(staticAssetsPath, STATIC_RESOURCES)
                );
            });
        }
    } catch (e) {
        throw new Error(`Unable to copy static resources: ${e.message || e}`);
    }
}

export function copyContentAssets(staticAssetsPath: string, project: Project) {
    const contentAssetsDir = project.contentAssetsDirectory;
    try {
        if (contentAssetsDir && contentAssetsDir !== '') {
            copyFiles(
                path.join(contentAssetsDir, '*'),
                path.join(staticAssetsPath, CONTENT_ASSETS)
            );
        }
    } catch (e) {
        console.warn(`Unable to copy contentAssets: ${e.getMessage || e}`);
    }
}

/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'path';
import { copyFiles, removeFile } from '../common/fileUtils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from './Constants';
import WebruntimeConfig from '../server/config/WebruntimeConfig';
import Project from './Project';

/**
 * Copy app static resources.
 */
export function copyStaticAssets(project: Project, config: WebruntimeConfig) {
    copyDistAssets(config);
    copyStaticResources(project, config);
    copyContentAssets(project, config);
}

export function copyDistAssets(config: WebruntimeConfig) {
    const distAssetsPath = path.join(config.serverDir, 'dist', 'assets');
    try {
        const localDevAssetsPath = path.join(
            config.buildDir,
            'assets',
            'localdev'
        );
        removeFile(localDevAssetsPath);
        copyFiles(path.join(distAssetsPath, '*'), localDevAssetsPath);
    } catch (e) {
        throw new Error(`Unable to copy dist assets: ${e.message || e}`);
    }
}

export function copyStaticResources(
    project: Project,
    config: WebruntimeConfig
) {
    const staticResources = project.staticResourcesDirectories;
    try {
        if (staticResources && staticResources.length > 0) {
            const assetsPath = path.join(
                config.buildDir,
                'assets',
                'project',
                STATIC_RESOURCES
            );
            removeFile(assetsPath);
            staticResources.forEach((item: string) => {
                copyFiles(path.join(item, '*'), assetsPath);
            });
        }
    } catch (e) {
        throw new Error(`Unable to copy static resources: ${e.message || e}`);
    }
}

export function copyContentAssets(project: Project, config: WebruntimeConfig) {
    const contentAssets = project.contentAssetsDirectories;
    try {
        if (contentAssets && contentAssets.length > 0) {
            const assetsPath = path.join(
                config.buildDir,
                'assets',
                'project',
                CONTENT_ASSETS
            );
            removeFile(assetsPath);
            contentAssets.forEach((item: string) => {
                copyFiles(path.join(item, '*'), assetsPath);
            });
        }
    } catch (e) {
        console.warn(`Unable to copy content assets: ${e.getMessage || e}`);
    }
}

export function rebuildResource(
    project: Project,
    config: WebruntimeConfig,
    resourcePath: string
) {
    if (isValidStaticResource(project, resourcePath)) {
        copyStaticResources(project, config);
    } else if (isValidContentAsset(project, resourcePath)) {
        copyContentAssets(project, config);
    } else {
        console.error(
            `Unable to reload resource ${resourcePath} to the local dev server cache.`
        );
        return;
    }
}

export function isValidStaticResource(
    project: Project,
    resourcePath: string
): boolean {
    let isValidStaticResource = false;
    const staticResources = project.staticResourcesDirectories;
    if (staticResources && staticResources.length > 0) {
        staticResources.forEach(item => {
            if (resourcePath.startsWith(item)) {
                isValidStaticResource = true;
                return;
            }
        });
    }
    return isValidStaticResource;
}

export function isValidContentAsset(
    project: Project,
    resourcePath: string
): boolean {
    let isValidStaticResource = false;
    const contentAssets = project.contentAssetsDirectories;
    if (contentAssets && contentAssets.length > 0) {
        contentAssets.forEach(item => {
            if (resourcePath.startsWith(item)) {
                isValidStaticResource = true;
                return;
            }
        });
    }
    return isValidStaticResource;
}

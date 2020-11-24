/*
 * Utility for ensuring static resources are copied correctly.
 */

import path from 'path';
import { copyFiles, removeFile } from '../common/fileUtils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from './Constants';
import WebruntimeConfig from '../server/config/WebruntimeConfig';
import Project from './Project';
import { static } from 'express';

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
    const contentAssetsDir = project.contentAssetsDirectory;
    try {
        if (contentAssetsDir && contentAssetsDir !== '') {
            const assetsPath = path.join(
                config.buildDir,
                'assets',
                'project',
                CONTENT_ASSETS
            );
            removeFile(assetsPath);
            copyFiles(path.join(contentAssetsDir, '*'), assetsPath);
        }
    } catch (e) {
        console.warn(`Unable to copy contentAssets: ${e.getMessage || e}`);
    }
}

export function rebuildResource(
    project: Project,
    config: WebruntimeConfig,
    resourcePath: string
) {
    let assetsPath = path.join(config.buildDir, 'assets', 'project');

    if (isValidStaticResource(project, resourcePath)) {
        assetsPath += STATIC_RESOURCES;
    } else if (isValidContentAsset(project, resourcePath)) {
        assetsPath += CONTENT_ASSETS;
    } else {
        return;
    }

    removeFile(assetsPath);
    copyFiles(path.join(resourcePath, '*'), assetsPath);
}

function isValidStaticResource(
    project: Project,
    resourcePath: string
): boolean {
    const staticResources = project.staticResourcesDirectories;
    if (staticResources && staticResources.length > 0) {
        staticResources.forEach(item => {
            if (resourcePath.startsWith(item)) {
                return true;
            }
        });
    }
    return false;
}

function isValidContentAsset(project: Project, resourcePath: string): boolean {
    const contentAssetsDir = project.contentAssetsDirectory;
    return (
        contentAssetsDir !== undefined &&
        contentAssetsDir !== '' &&
        resourcePath.startsWith(contentAssetsDir)
    );
}

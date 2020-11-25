import reload from 'reload';
import chokidar from 'chokidar';
import { AppExtensionConfig } from '@webruntime/api';
import WebruntimeConfig from 'server/config/WebruntimeConfig';
import { rebuildResource } from '../../common/StaticResourcesUtils';
import Project from 'common/Project';

export function liveReload(
    metadataPath: string,
    project: Project,
    config: WebruntimeConfig
) {
    let reloadReturned: any;
    let fileWatcher: chokidar.FSWatcher;

    return {
        extendApp: async ({ app }: AppExtensionConfig) => {
            reloadReturned = await reload(app);

            const filesToWatch = getFilesToWatch(metadataPath, project);
            fileWatcher = chokidar.watch(filesToWatch, {
                ignoreInitial: true
            });

            fileWatcher.on('change', path => {
                if (path && path !== metadataPath) {
                    rebuildResource(project, config, path);
                } else {
                    // Only reload when we have a change to the metadataPath.
                    reloadReturned.reload();
                }
            });

            fileWatcher.on('add', path => {
                if (path && path !== metadataPath) {
                    rebuildResource(project, config, path);
                }
            });

            fileWatcher.on('unlink', path => {
                if (path && path !== metadataPath) {
                    rebuildResource(project, config, path);
                }
            });
        },
        close: async () => {
            if (reloadReturned) {
                await reloadReturned.closeServer();
            }

            if (fileWatcher) {
                await fileWatcher.close();
            }
        }
    };
}

export function getFilesToWatch(
    metadataPath: string,
    project: Project
): string[] {
    let filesToWatch = [metadataPath];

    const staticResources = project.staticResourcesDirectories;
    if (staticResources && staticResources.length > 0) {
        staticResources.forEach((item: string) => {
            filesToWatch.push(item);
        });
    }

    const contentAssetsDir = project.contentAssetsDirectory;
    if (contentAssetsDir && contentAssetsDir !== '') {
        filesToWatch.push(contentAssetsDir);
    }

    return filesToWatch;
}

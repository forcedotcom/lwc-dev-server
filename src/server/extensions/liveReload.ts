import reload from 'reload';
import chokidar from 'chokidar';
import { AppExtensionConfig } from '@webruntime/api';
import WebruntimeConfig from 'server/config/WebruntimeConfig';
import { copyStaticResources } from '../../common/StaticResourcesUtils';
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

            fileWatcher = chokidar.watch(metadataPath, {
                ignoreInitial: true
            });

            const staticResources = project.staticResourcesDirectories;
            if (staticResources && staticResources.length > 0) {
                staticResources.forEach((item: string) => {
                    fileWatcher.add(item);
                });
            }

            const contentAssetsDir = project.contentAssetsDirectory;
            if (contentAssetsDir && contentAssetsDir !== '') {
                fileWatcher.add(contentAssetsDir);
            }

            fileWatcher.on('change', path => {
                console.log('Path was: ' + path);
                if (path && !path.endsWith('metadata.json')) {
                    copyStaticResources(project, config);
                } else {
                    reloadReturned.reload();
                }
            });

            fileWatcher.on('add', path => {
                copyStaticResources(project, config);
                reloadReturned.reload();
            });

            fileWatcher.on('unlink', path => {
                copyStaticResources(project, config);
                reloadReturned.reload();
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

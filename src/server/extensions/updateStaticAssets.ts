import chokidar from 'chokidar';
import { AppExtensionConfig } from '@webruntime/api';
import { copyStaticResources } from '../../common/StaticResourcesUtils';
import Project from 'common/Project';
import WebruntimeConfig from 'server/config/WebruntimeConfig';
import reload from 'reload';

// Will this essentially mean we reload twice?
export function updateStaticAssets(
    assetPaths: string[],
    project: Project,
    config: WebruntimeConfig
) {
    let reloadReturned: any;
    let fileWatcher: chokidar.FSWatcher;

    return {
        extendApp: async ({ app }: AppExtensionConfig) => {
            reloadReturned = await reload(app);

            fileWatcher = chokidar.watch(assetPaths, {
                ignoreInitial: true
            });

            fileWatcher.on('change', () => {
                copyStaticResources(project, config);
                reloadReturned.reload();
            });
        },
        close: async () => {
            if (fileWatcher) {
                await fileWatcher.close();
            }
        }
    };
}

import chokidar from 'chokidar';
import { AppExtensionConfig } from '@webruntime/api';

// Assumes that the liveReload will be kicked off as well. Therefore, this
// will not reload. Not sure how timing will be though.
export function updateStaticAssets(assetPaths: string[]) {
    let fileWatcher: chokidar.FSWatcher;

    return {
        extendApp: async ({ app }: AppExtensionConfig) => {
            fileWatcher = chokidar.watch(assetPaths, {
                ignoreInitial: true
            });

            fileWatcher.on('change', () => {
                // TODO - update static assets folder
            });
        },
        close: async () => {
            if (fileWatcher) {
                await fileWatcher.close();
            }
        }
    };
}

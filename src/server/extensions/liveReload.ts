import reload from 'reload';
import chokidar from 'chokidar';
import { Application } from 'express';

export function liveReload(metadataPath: string) {
    let reloadReturned: any;
    let fileWatcher: chokidar.FSWatcher;

    return {
        extendApp: async ({ app }: { app: Application }) => {
            reloadReturned = await reload(app);

            fileWatcher = chokidar.watch(metadataPath, {
                ignoreInitial: true
            });

            fileWatcher.on('change', () => {
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

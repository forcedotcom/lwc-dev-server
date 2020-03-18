import reload from 'reload';
import chokidar from 'chokidar';
import { Application } from 'express';

export function LiveReload(metadataPath: string) {
    return {
        extendApp: async ({ app }: { app: Application }) => {
            const reloadReturned = await reload(app);

            const fileWatcher = chokidar.watch(metadataPath, {
                ignoreInitial: true
            });

            fileWatcher.on('change', () => {
                reloadReturned.reload();
            });
        }
    };
}

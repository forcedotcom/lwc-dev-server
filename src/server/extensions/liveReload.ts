import reload from 'reload';
import chokidar from 'chokidar';
import { AppExtensionConfig } from '@webruntime/api';

export function liveReload(metadataPath: string) {
    return {
        extendApp: async ({ app }: AppExtensionConfig) => {
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

import reload from 'reload';
import chokidar from 'chokidar';
import { Application } from 'express';
import getPort from 'get-port';
import debugLogger from 'debug';

const debug = debugLogger('localdevserver:livereload');

export function liveReload(metadataPath: string) {
    return {
        extendApp: async ({ app }: { app: Application }) => {
            /**
             * We are using getPort() since reload will always try to use default
             * port. If we have two LocalDev servers going at the same time
             * the server would fail here unless we start reload on a new unused port.
             */
            const availablePort = await getPort();
            debug(`Listening on port: ${availablePort}`);

            const reloadReturned = await reload(app, {
                port: availablePort
            });

            const fileWatcher = chokidar.watch(metadataPath, {
                ignoreInitial: true
            });

            fileWatcher.on('change', () => {
                reloadReturned.reload();
            });
        }
    };
}

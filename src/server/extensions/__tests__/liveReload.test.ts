import express, { Application } from 'express';
import reload from 'reload';
import chokidar from 'chokidar';
import { liveReload } from '../liveReload';
import { ExtensionOptions } from '@webruntime/api';

jest.mock('chokidar', () => {
    return {
        watch: jest.fn(() => {
            return {
                on: jest.fn(),
                close: jest.fn()
            };
        })
    };
});

jest.mock('reload', () => {
    return jest.fn(() =>
        Promise.resolve({
            reload: jest.fn(),
            closeServer: jest.fn()
        })
    );
});

jest.mock('express', () => {
    return jest.fn(() => {
        return {
            get: jest.fn(),
            use: jest.fn()
        };
    });
});

describe('liveReload', () => {
    it('should return a LWR extension', () => {
        const extension = liveReload('/Users/arya/dev/myproject');

        expect(extension).toHaveProperty('extendApp');
    });

    describe('extendApp', () => {
        let app: Application;
        let options: ExtensionOptions;

        beforeEach(() => {
            // @ts-ignore
            reload.mockClear();
            // @ts-ignore
            chokidar.watch.mockClear();

            app = express();
        });

        it('should start reload server', async () => {
            const extension = liveReload('/Users/arya/dev/myproject');

            await extension.extendApp({ app, options });

            expect(reload).toHaveBeenCalledTimes(1);
        });

        it('should start a file watcher', async () => {
            const extension = liveReload('/Users/arya/dev/myproject');

            await extension.extendApp({ app, options });

            expect(chokidar.watch).toHaveBeenCalledTimes(1);

            // @ts-ignore
            const reloadReturned = await reload.mock.results[0].value;
            // @ts-ignore
            const watchResult = chokidar.watch.mock.results[0].value;
            const [watchEvent, watchCallback] = watchResult.on.mock.calls[0];

            watchCallback();

            expect(watchEvent).toEqual('change');
            expect(reloadReturned.reload).toBeCalledTimes(1);
        });
    });

    describe('close', () => {
        let app: Application;

        beforeEach(() => {
            // @ts-ignore
            reload.mockClear();
            // @ts-ignore
            chokidar.watch.mockClear();

            app = express();
        });

        it('should close the reload server', async () => {
            const extension = liveReload('/Users/arya/dev/myproject');

            await extension.extendApp({ app });

            // @ts-ignore
            const reloadReturned = await reload.mock.results[0].value;

            await extension.close();

            expect(reloadReturned.closeServer).toBeCalledTimes(1);
        });

        it('should close the file watcher', async () => {
            const extension = liveReload('/Users/arya/dev/myproject');

            await extension.extendApp({ app });

            // @ts-ignore
            const fileWatcher = chokidar.watch.mock.results[0].value;

            await extension.close();

            expect(fileWatcher.close).toBeCalledTimes(1);
        });
    });
});

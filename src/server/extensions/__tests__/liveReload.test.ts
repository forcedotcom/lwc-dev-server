import express, { Application } from 'express';
import reload from 'reload';
import chokidar from 'chokidar';
import { liveReload, getFilesToWatch } from '../liveReload';
import { ExtensionOptions } from '@webruntime/api';
import Project from '../../../common/Project';
import WebruntimeConfig from '../../config/WebruntimeConfig';
import path from 'path';
import mockFs from 'mock-fs';

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

jest.mock('../../../common/Project');
jest.mock('../../config/WebruntimeConfig');

describe('liveReload', () => {
    let project: Project;
    let config: WebruntimeConfig;

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject');

        // @ts-ignore
        config = WebruntimeConfig.mockImplementation(() => {
            return {
                buildDir: 'Users/arya/dev/myproject/.localdevserver',
                serverDir: path.join(__dirname, '..', '..', '..'),
                server: {
                    resourceRoot: '/webruntime'
                }
            };
        });
    });

    it('should return a LWR extension', () => {
        const extension = liveReload(
            '/Users/arya/dev/myproject',
            project,
            config
        );

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
            const extension = liveReload(
                '/Users/arya/dev/myproject',
                project,
                config
            );

            await extension.extendApp({ app, options });

            expect(reload).toHaveBeenCalledTimes(1);
        });

        it('should start a file watcher for change events', async () => {
            const extension = liveReload(
                '/Users/arya/dev/myproject',
                project,
                config
            );

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

        it('should start a file watcher for add events', async () => {
            const extension = liveReload(
                '/Users/arya/dev/myproject',
                project,
                config
            );

            await extension.extendApp({ app, options });

            expect(chokidar.watch).toHaveBeenCalledTimes(1);

            // @ts-ignore
            const reloadReturned = await reload.mock.results[0].value;
            // @ts-ignore
            const watchResult = chokidar.watch.mock.results[0].value;
            const [watchEvent, watchCallback] = watchResult.on.mock.calls[1];

            watchCallback();

            expect(watchEvent).toEqual('add');
            expect(reloadReturned.reload).toBeCalledTimes(1);
        });

        it('should start a file watcher for unlink events', async () => {
            const extension = liveReload(
                '/Users/arya/dev/myproject',
                project,
                config
            );

            await extension.extendApp({ app, options });

            expect(chokidar.watch).toHaveBeenCalledTimes(1);

            // @ts-ignore
            const reloadReturned = await reload.mock.results[0].value;

            // @ts-ignore
            const watchResult = chokidar.watch.mock.results[0].value;
            const [watchEvent, watchCallback] = watchResult.on.mock.calls[2];

            watchCallback();

            expect(watchEvent).toEqual('unlink');
            expect(reloadReturned.reload).toBeCalledTimes(1);
        });

        it('should return static resources in file watcher list', async () => {
            const filesToWatch = getFilesToWatch(
                '/Users/arya/dev/myproject',
                project
            );
            expect(filesToWatch).toEqual([
                '/Users/arya/dev/myproject',
                'src/staticResourceOne',
                'src/staticResourceTwo',
                'src/contentAssetDir'
            ]);
        });

        it('should reload on static resource change', async () => {
            // jest.mock('chokidar', () => {
            //     return {
            //         watch: function(fileName) {
            //         }
            //     };
            // });
            // mockFs({
            //     'src/staticResourceOne': {
            //         'staticResourceOne-1.txt': 'sample1',
            //         'staticResourceOne-2.txt': 'sample2'
            //     },
            //     'src/staticResourceTwo': {
            //         'staticResourceTwo.txt': 'otherSample'
            //     },
            //     'src/contentAssetDir': {
            //         'contentAssetOne.txt': 'asset1',
            //         'contentAssetTwo.txt': 'asset2'
            //     }
            // });
        });
    });

    describe('close', () => {
        let app: Application;
        let options: ExtensionOptions;

        beforeEach(() => {
            // @ts-ignore
            reload.mockClear();
            // @ts-ignore
            chokidar.watch.mockClear();

            app = express();
        });

        it('should close the reload server', async () => {
            const extension = liveReload(
                '/Users/arya/dev/myproject',
                project,
                config
            );

            await extension.extendApp({ app, options });

            // @ts-ignore
            const reloadReturned = await reload.mock.results[0].value;

            await extension.close();

            expect(reloadReturned.closeServer).toBeCalledTimes(1);
        });

        it('should close the file watcher', async () => {
            const extension = liveReload(
                '/Users/arya/dev/myproject',
                project,
                config
            );

            await extension.extendApp({ app, options });

            // @ts-ignore
            const fileWatcher = chokidar.watch.mock.results[0].value;

            await extension.close();

            expect(fileWatcher.close).toBeCalledTimes(1);
        });
    });
});

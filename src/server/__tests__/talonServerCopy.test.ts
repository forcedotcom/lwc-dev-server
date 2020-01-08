import * as talonServer from '../talonServerCopy';
import mockFs from 'mock-fs';
import colors from 'colors';

jest.mock('compression', () => {
    const compressionMock = jest.fn();
    return jest.fn(() => compressionMock);
});
jest.mock('@webruntime/framework-server', () => {
    return {
        contextService: {
            startContext: jest.fn(() => {
                return {
                    templateDir: '',
                    outputDir: '',
                    basePath: '',
                    srcDir: ''
                };
            }),
            endContext: jest.fn()
        },
        resourceMiddleware: jest.fn(),
        staticMiddleware: jest.fn(),
        templateMiddleware: jest.fn(),
        apiMiddleware: jest.fn(),
        compileErrorMiddleware: jest.fn()
    };
});
jest.mock('express', () => {
    const expressMock = {
        use: jest.fn(),
        get: jest.fn(),
        static: jest.fn()
    };
    const express = jest.fn(() => {
        return expressMock;
    });
    const staticMock = jest.fn();
    Object.defineProperty(express, 'static', {
        get: () => staticMock
    });
    return express;
});
jest.mock('reload', () => {
    return jest.fn(() =>
        Promise.resolve({
            reload: jest.fn(),
            closeServer: jest.fn()
        })
    );
});
jest.mock('watch', () => {
    return {
        watchTree: jest.fn(),
        unwatchTree: jest.fn()
    };
});

describe('talonServerCopy', () => {
    afterEach(() => {
        mockFs.restore();
    });

    describe('getRootApp', () => {
        test('wraps application with basePath when provided', async () => {
            const app = require('express')();
            const basePath = '/basePath';

            const rootApp = talonServer.getRootApp(app, basePath);

            expect(rootApp.use.mock.calls[0][0]).toBe(basePath);
            expect(rootApp.use.mock.calls[0][1]).toBe(app);
        });
    });

    describe('createServer', () => {
        test('adds gzip compression middleware', async () => {
            const compressionMiddleware = require('compression')();
            const app = require('express')();
            (app.use as any).mockClear();

            await talonServer.createServer({});

            expect(app.use.mock.calls[0][0]).toBe(compressionMiddleware);
        });

        test('starts live reload when options enabled it', async () => {
            const reload = require('reload');
            (reload as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            expect(reload).toBeCalledTimes(1);
        });

        test('live reload calls watch tree', async () => {
            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            expect(watch.watchTree).toBeCalledTimes(1);
        });

        test('watch callback does not reload for the initial invoke', async () => {
            const reload = require('reload');
            (reload as any).mockClear();

            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            const reloadReturned = await reload.mock.results[0].value;

            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback({}, null, null);

            expect(reloadReturned.reload).toBeCalledTimes(0);
        });

        test('watch callback does not reload for non-string file argument', async () => {
            const reload = require('reload');
            (reload as any).mockClear();

            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            const reloadReturned = await reload.mock.results[0].value;

            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback([]);

            expect(reloadReturned.reload).toBeCalledTimes(0);
        });

        test('watch callback does not reload for ignored files', async () => {
            const reload = require('reload');
            (reload as any).mockClear();

            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            mockFs({
                '.forceignore': '**/jsconfig.json'
            });

            const reloadReturned = await reload.mock.results[0].value;

            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback('jsconfig.json');

            expect(reloadReturned.reload).toBeCalledTimes(0);
        });

        test('watch callback reloads for component files', async () => {
            const reload = require('reload');
            (reload as any).mockClear();

            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            const reloadReturned = await reload.mock.results[0].value;

            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback('path/to/mycomponent.html');

            expect(reloadReturned.reload).toBeCalledTimes(1);
        });

        test('watch callback calls watchTree for a new directory', async () => {
            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            mockFs({
                'path/to/mycomponent.html': ''
            });

            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback('path/to');

            // watchTree is called on startup and as a result of the callback
            expect(watch.watchTree).toBeCalledTimes(2);
        });

        test('watch callback does not call watchTree for a deleted directory', async () => {
            const watch = require('watch');
            (watch.watchTree as any).mockClear();

            await talonServer.createServer({
                liveReload: true
            });

            mockFs({
                'path/to/mycomponent.html': ''
            });

            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback('path/to');

            mockFs.restore();

            watchCallback('path/to');

            // watchTree is called on startup and as a result of the first callback
            expect(watch.watchTree).toBeCalledTimes(2);
        });
    });

    describe('startServer', () => {
        test('on server start, log outputs message', async () => {
            const expected = colors.magenta.bold(
                `Server up on http://localhost:${1234}`
            );

            let listenCallback = () => {};
            const server = {
                on: jest.fn(),
                address: () => {
                    return { port: 1234 };
                }
            };
            const app = require('express')();
            app.listen = jest.fn((port, callback) => {
                listenCallback = callback;
                return server;
            });
            const logSpy = jest.spyOn(console, 'log');

            await talonServer.startServer(app, '', 1234);
            listenCallback();

            expect(logSpy.mock.calls[0][0]).toBe(expected);
        });

        test('port passed to start server is used for listening on the application', async () => {
            let actual;
            const server = { on: jest.fn() };
            const app = require('express')();
            app.listen = jest.fn((port, callback) => {
                actual = port;
                return server;
            });
            const onClose = jest.fn();

            await talonServer.startServer(app, '', 1234, onClose);

            expect(actual).toBe(1234);
        });

        test('onClose called on server close', async () => {
            const server = { on: jest.fn() };
            const app = require('express')();
            app.listen = jest.fn(() => server);
            const onClose = jest.fn();

            await talonServer.startServer(app, '', 3000, onClose);

            const onServerClose = server.on.mock.calls[0][1];
            await onServerClose();

            expect(onClose).toBeCalledTimes(1);
        });
    });

    describe('salesforceStaticAssetsRoute', () => {
        afterEach(() => {
            mockFs.restore();
        });

        test('allows slds assets', async () => {
            const basePath = '/basePath';
            const request = {
                url: '/assets/styles/slds.css'
            } as any;
            const response = jest.fn() as any;
            const next = jest.fn();

            const middleware = talonServer.salesforceStaticAssetsRoute(
                basePath
            );
            middleware(request, response, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });

        test('routes non slds assets which have an extension', async () => {
            const basePath = '/basePath';
            const request = {
                url: '/my/file.ico',
                params: ['file.ico']
            } as any;
            const response = jest.fn() as any;
            const next = jest.fn();

            const middleware = talonServer.salesforceStaticAssetsRoute(
                basePath
            );
            middleware(request, response, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith('route');
            expect(request.url).toBe('/basePath/assets/file.ico');
        });

        test('routes static resources to resource-meta.xml', async () => {
            const basePath = '/basePath';
            const request = {
                url: '/my/module',
                params: ['asset1']
            } as any;
            const response = jest.fn() as any;
            const next = jest.fn();
            mockFs({
                '.localdevserver/public/basePath/assets/asset1.resource-meta.xml': `
                        <StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
                            <cacheControl>Private</cacheControl>
                            <contentType>application/javascript</contentType>
                        </StaticResource>
                    `
            });

            const middleware = talonServer.salesforceStaticAssetsRoute(
                basePath
            );
            middleware(request, response, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith('route');
            expect(request.url).toBe('/basePath/assets/asset1.js');
        });
    });
});

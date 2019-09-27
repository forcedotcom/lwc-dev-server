import * as talonServer from '../talonServerCopy';
import mockFs from 'mock-fs';

jest.mock('compression', () => {
    const compressionMock = jest.fn();
    return jest.fn(() => compressionMock);
});
jest.mock('@webruntime/compiler', () => {
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
    return jest.fn(() => Promise.resolve());
});
jest.mock('watch', () => {
    return {
        watchTree: jest.fn(),
        unwatchTree: jest.fn()
    };
});

describe('talonServerCopy', () => {
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
            const watchCallback = watch.watchTree.mock.calls[0][2];
            watchCallback(null);

            expect(watch.watchTree).toBeCalledTimes(1);
        });
    });

    describe('startServer', () => {
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

    describe('showRoute', () => {
        test('sendFile when filepath contains in sourceDir', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.js'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).toBeCalledTimes(1);
        });

        test('file not sent when filepath does not contain source directory', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.js'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/sourceCodeDirectory');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });

        test('file not sent when filepath contains relative path signifiers out of the root directory', () => {
            const request = {
                query: {
                    file: '/rootDir/../fileName.js'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });

        test('showRoute filter allows js extension', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.js'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).toBeCalledTimes(1);
        });

        test('showRoute filter allows css extension', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.css'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).toBeCalledTimes(1);
        });

        test('showRoute filter allows html extension', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.html'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).toBeCalledTimes(1);
        });

        test('showRoute filter excludes ts extension', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.ts'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });

        test('showRoute filters excludes non approved extensions', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName.txt'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });

        test('showRoute filters excludes file without extension', () => {
            const request = {
                query: {
                    file: '/rootDir/fileName'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });

        test('showRoute filters excludes hidden files', () => {
            const request = {
                query: {
                    file: '/rootDir/.fileName'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            const route = talonServer.showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });
    });
});

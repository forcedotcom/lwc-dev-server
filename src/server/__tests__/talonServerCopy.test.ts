import * as talonServer from '../talonServerCopy';

jest.mock('compression', () => {
    const compressionMock = jest.fn();
    return jest.fn(() => compressionMock);
});
jest.mock('@talon/compiler', () => {
    return {
        startContext: jest.fn(() => {
            return {
                templateDir: '',
                outputDir: '',
                basePath: '',
                srcDir: ''
            };
        }),
        resourceMiddleware: jest.fn(),
        staticMiddleware: jest.fn(),
        templateMiddleware: jest.fn(),
        apiMiddleware: jest.fn()
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

describe('talonServerCopy', () => {
    //afterEach(jest.resetAllMocks);

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
    });

    describe('salesforceStaticAssetsRoute', () => {
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

        test('file not sent when filepath contains relative path signifiers', () => {
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
    });
});

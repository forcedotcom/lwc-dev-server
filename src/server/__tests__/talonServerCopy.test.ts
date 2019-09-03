import * as talonServer from '../talonServerCopy';

jest.mock('compression', () => jest.fn());
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
    afterEach(jest.resetAllMocks);

    describe('createServer', () => {
        beforeEach(() => {});

        test('adds gzip compression middleware', async () => {
            const compressionMiddleware = require('compression')();
            const app = require('express')();

            await talonServer.createServer({});

            expect(app.use.mock.calls[0][0]).toBe(compressionMiddleware);
        });

        // test('adds CSP Nonce middleware', async () => {});
        // test('adds CSP Policy middleware', async () => {});
        // test('adds gzip compression', async () => {});
        // test('adds cookie parser middleware', async () => {});
        // test('adds csurf middleware', async () => {});
        // test('adds resource middleware', async () => {});
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

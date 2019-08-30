import { showRoute } from '../talonServerCopy';

describe('talonServerCopy', () => {
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

            const route = showRoute('/rootDir');

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

            const route = showRoute('/sourceCodeDirectory');

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

            const route = showRoute('/rootDir');

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

            const route = showRoute('/rootDir');

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

            const route = showRoute('/rootDir');

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

            const route = showRoute('/rootDir');

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

            const route = showRoute('/rootDir');

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

            const route = showRoute('/rootDir');

            // @ts-ignore
            route(request, response, null);

            expect(response.sendFile).not.toBeCalled();
        });
    });
});

import express, { Application } from 'express';
import { resourceUrl } from '../resourceUrl';
import { ExtensionOptions } from '@webruntime/api';
import mockFs from 'mock-fs';

jest.mock('express', () => {
    return jest.fn(() => {
        return {
            get: jest.fn(),
            use: jest.fn()
        };
    });
});

describe('resourceUrl', () => {
    it('should return a LWR extension', () => {
        const extension = resourceUrl();

        expect(extension).toHaveProperty('extendApp');
    });

    describe('extendApp', () => {
        let app: Application;
        let options: ExtensionOptions;

        beforeEach(() => {
            app = express();
            options = {
                buildDir: '/Users/arya/dev/myproject/.localdevserver',
                projectDir: '/Users/arya/dev/myproject',
                server: {
                    resourceRoot: '/webruntime',
                    basePath: '/basePath'
                },
                compilerConfig: {}
            };
        });

        afterEach(() => {
            mockFs.restore();
            jest.restoreAllMocks();
        });

        it('should add the GET assets route', () => {
            const extension = resourceUrl();
            extension.extendApp({ app, options });
            const route = (app.get as jest.Mock).mock.calls[0][0];

            expect(route).toMatch('/assets/project');
        });

        it('should update req.url and call next if the file exists', () => {
            const extension = resourceUrl();
            extension.extendApp({ app, options });

            mockFs({
                [`${options.buildDir}/assets/project/chartJs/Chart.min.js`]: 'const foo;'
            });

            const req: any = {
                url: '/assets/project/3646d9b522/chartJs/Chart.min.js',
                params: {
                    '0': 'chartJs/Chart.min.js',
                    versionKey: '158104e2eb'
                }
            };
            const res: any = {
                sendStatus: jest.fn()
            };
            const next = jest.fn();

            const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
            routeHandler(req, res, next);

            expect(req.url).toBe('/assets/project/chartJs/Chart.min.js');
            expect(next).toBeCalledTimes(1);
        });

        it('should return 404 if the file doesnt exit', () => {
            const extension = resourceUrl();
            extension.extendApp({ app, options });

            mockFs({
                [`${options.buildDir}/assets/project/chartJs/Chart.js`]: 'const foo;'
            });

            const req: any = {
                url: '/assets/project/3646d9b522/chartJs/Chart.min.js',
                params: {
                    '0': 'chartJs/Chart.min.js',
                    versionKey: '158104e2eb'
                }
            };
            const res: any = {
                sendStatus: jest.fn()
            };
            const next = jest.fn();

            const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
            routeHandler(req, res, next);

            expect(res.sendStatus).toBeCalledWith(404);
            expect(next).not.toBeCalled();
        });
    });
});

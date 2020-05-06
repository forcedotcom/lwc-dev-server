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

            jest.spyOn(console, 'log').mockImplementation();
            jest.spyOn(console, 'warn').mockImplementation();
            jest.spyOn(console, 'error').mockImplementation();
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
                    versionKey: '3646d9b522'
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

        it('should send 404 if the file doesnt exist', () => {
            const extension = resourceUrl();
            extension.extendApp({ app, options });

            mockFs({
                [`${options.buildDir}/assets/project/chartJs/Chart.js`]: 'const foo;'
            });

            const req: any = {
                url: '/assets/project/3646d9b522/chartJs/Chart.min.js',
                params: {
                    '0': 'chartJs/Chart.min.js',
                    versionKey: '3646d9b522'
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

        describe('when the original url does not contain the file extension', () => {
            it('should find the ext from resource-meta.xml and add it to the url path', () => {
                const extension = resourceUrl();
                extension.extendApp({ app, options });

                mockFs({
                    [options.buildDir]: {
                        assets: {
                            project: {
                                'moment.js': 'const foo;',
                                'moment.resource-meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
                                                                <StaticResource>
                                                                <cacheControl>Private</cacheControl>
                                                                <contentType>application/javascript</contentType>
                                                                </StaticResource>`
                            }
                        }
                    }
                });

                const req: any = {
                    url: '/assets/project/3646d9b522/moment',
                    params: {
                        '0': 'moment',
                        versionKey: '3646d9b522'
                    }
                };
                const res: any = {
                    sendStatus: jest.fn()
                };
                const next = jest.fn();

                const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
                routeHandler(req, res, next);

                expect(req.url).toBe('/assets/project/moment.js');
                expect(next).toBeCalledTimes(1);
            });

            it('should send a 404 if the resource-meta.xml file does not exist', () => {
                const extension = resourceUrl();
                extension.extendApp({ app, options });

                mockFs({
                    [options.buildDir]: {
                        assets: {
                            project: {
                                'moment.js': 'const foo;'
                            }
                        }
                    }
                });

                const req: any = {
                    url: '/assets/project/3646d9b522/moment',
                    params: {
                        '0': 'moment',
                        versionKey: '3646d9b522'
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

            it('should log a warning and send 404 if resource-meta.xml has an error', () => {
                const extension = resourceUrl();
                extension.extendApp({ app, options });

                mockFs({
                    [options.buildDir]: {
                        assets: {
                            project: {
                                'moment.js': 'const foo;',
                                'moment.resource-meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
                                                                <StaticResource>
                                                                <cacheControl>Private</cacheControl>
                                                                <contentType>application/javascript</contentType>
                                                                </XXXX>`
                            }
                        }
                    }
                });

                const req: any = {
                    url: '/assets/project/3646d9b522/moment',
                    params: {
                        '0': 'moment',
                        versionKey: '3646d9b522'
                    }
                };
                const res: any = {
                    sendStatus: jest.fn()
                };
                const next = jest.fn();

                const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
                routeHandler(req, res, next);

                expect(console.warn).toBeCalledWith(
                    expect.stringContaining('Unable to determine')
                );
                expect(res.sendStatus).toBeCalledWith(404);
                expect(next).not.toBeCalled();
            });

            it('should log a warning and send 404 if resource-meta.xml is missing the mime type', () => {
                const extension = resourceUrl();
                extension.extendApp({ app, options });

                mockFs({
                    [options.buildDir]: {
                        assets: {
                            project: {
                                'moment.js': 'const foo;',
                                'moment.resource-meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
                                                                <StaticResource>
                                                                <cacheControl>Private</cacheControl>
                                                                </StaticResource>`
                            }
                        }
                    }
                });

                const req: any = {
                    url: '/assets/project/3646d9b522/moment',
                    params: {
                        '0': 'moment',
                        versionKey: '3646d9b522'
                    }
                };
                const res: any = {
                    sendStatus: jest.fn()
                };
                const next = jest.fn();

                const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
                routeHandler(req, res, next);

                expect(console.warn).toBeCalledWith(
                    expect.stringContaining('The contentType is missing')
                );
                expect(res.sendStatus).toBeCalledWith(404);
                expect(next).not.toBeCalled();
            });

            it('should send a 404 if the static asset file does not exist', () => {
                const extension = resourceUrl();
                extension.extendApp({ app, options });

                mockFs({
                    [options.buildDir]: {
                        assets: {
                            project: {
                                'moment.resource-meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
                                                                <StaticResource>
                                                                <cacheControl>Private</cacheControl>
                                                                <contentType>application/javascript</contentType>
                                                                </StaticResource>`
                            }
                        }
                    }
                });

                const req: any = {
                    url: '/assets/project/3646d9b522/moment',
                    params: {
                        '0': 'moment',
                        versionKey: '3646d9b522'
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
});

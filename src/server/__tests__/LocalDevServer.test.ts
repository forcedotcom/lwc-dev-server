import path from 'path';
import LocalDevServer, { defaultOutputDirectory } from '../LocalDevServer';
import Project from '../../common/Project';
import * as fileUtils from '../../common/fileUtils';
import * as talonServer from '../talonServerCopy';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';
import cpx from 'cpx';
import os from 'os';
import ComponentIndex, {
    ProjectMetadata,
    PackageComponent
} from '../../common/ComponentIndex';
import LocalDevTelemetryReporter from '../../instrumentation/LocalDevTelemetryReporter';
import fs from 'fs';
import { webruntimeConfig } from '../webruntimeConfig';

jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
jest.mock('../talonServerCopy');
jest.mock('cpx');
jest.mock('../../common/ComponentIndex');

function mockProject({
    projectPath,
    modulesPath = 'src/modules',
    port = 3000,
    version = '45.0'
}: {
    projectPath: string;
    modulesPath?: string;
    port?: number;
    version?: string;
}): Project {
    // Some ts-ignores because mockImplementation doesn't exist on the class.
    const localDevServerConfigurationMock = new LocalDevServerConfiguration();
    jest.spyOn(localDevServerConfigurationMock, 'port', 'get').mockReturnValue(
        port
    );
    jest.spyOn(
        localDevServerConfigurationMock,
        'api_version',
        'get'
    ).mockReturnValue(version);

    const project = new Project(projectPath);
    Object.defineProperty(project, 'directory', {
        get: jest.fn(() => projectPath)
    });
    Object.defineProperty(project, 'modulesSourceDirectory', {
        get: jest.fn(() => modulesPath)
    });
    Object.defineProperty(project, 'configuration', {
        get: jest.fn(() => localDevServerConfigurationMock)
    });

    return project;
}

describe('LocalDevServer', () => {
    beforeEach(() => {
        jest.spyOn(talonServer, 'createServer').mockImplementation((): any => {
            return {
                start: jest.fn(),
                use: jest.fn(),
                get: jest.fn()
            };
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
        webruntimeConfig.rollup.plugins.length = 0;
    });

    describe('start()', () => {
        it('specifies the outputDirectory in the talon server configuration', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });
            const mockConn: any = {};
            const onClose = () => {};

            const server = new LocalDevServer();
            await server.start(project, mockConn);

            const expected = path.join(projectPath, defaultOutputDirectory);

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    outputDir: expected
                }),
                expect.anything(),
                mockConn
            );
        });

        it('configures the modulePaths with the localdevserver modules', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });
            const mockConn: any = {};

            const server = new LocalDevServer();
            await server.start(project, mockConn);

            const expected = path.resolve(__dirname, '../../../');

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything(),
                mockConn
            );
        });

        it('configures the modulePaths with the 218 and 220 depenencies when using 220', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath, version: '47.0' });
            const mockConn: any = {};

            //require.resolve
            jest.spyOn(require, 'resolve').mockImplementation(
                () =>
                    'node_modules/@salesforce/lwc-dev-server-dependencies/index.js'
            );

            jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);

            const server = new LocalDevServer();
            await server.start(project, mockConn);

            const expected = [
                path.resolve(
                    __dirname,
                    '../../../node_modules/@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218'
                ),
                path.resolve(
                    __dirname,
                    '../../../node_modules/@salesforce/lwc-dev-server-dependencies/vendors/dependencies-222'
                )
            ];

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining(expected)
                }),
                expect.anything(),
                mockConn
            );

            jest.restoreAllMocks();
        });

        it('configures the modulePaths with the matching version resources directory', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath, version: '45.0' });
            const mockConn: any = {};

            //require.resolve
            jest.spyOn(require, 'resolve').mockImplementation(
                () =>
                    'node_modules/@salesforce/lwc-dev-server-dependencies/index.js'
            );

            jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);

            const server = new LocalDevServer();
            await server.start(project, mockConn);
            // require.resolve('@salesforce/lwc-dev-server-dependencies')
            const expected = path.resolve(
                __dirname,
                '../../../node_modules/@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218'
            );

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything(),
                mockConn
            );

            jest.restoreAllMocks();
        });

        it('configures the modulePaths with the matching virtual modules directory for 224', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath, version: '48.0' });
            const mockConn: any = {};

            jest.spyOn(require, 'resolve').mockImplementation(
                () =>
                    'node_modules/@salesforce/lwc-dev-server-dependencies/index.js'
            );

            jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);

            const server = new LocalDevServer();
            await server.start(project, mockConn);

            const expected = path.resolve(
                __dirname,
                '../../../virtual-modules/224'
            );

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything(),
                mockConn
            );

            jest.restoreAllMocks();
        });

        it('configures the modulePaths with the matching virtual modules directory for 226', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath, version: '49.0' });
            const mockConn: any = {};

            jest.spyOn(require, 'resolve').mockImplementation(
                () =>
                    'node_modules/@salesforce/lwc-dev-server-dependencies/index.js'
            );

            jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);

            const server = new LocalDevServer();
            await server.start(project, mockConn);

            const expected = path.resolve(
                __dirname,
                '../../../virtual-modules/226'
            );

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything(),
                mockConn
            );

            jest.restoreAllMocks();
        });

        it('does not error if a matching virtual module directory is not present', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath, version: '47.0' });
            const mockConn: any = {};

            jest.spyOn(require, 'resolve').mockImplementation(
                () =>
                    'node_modules/@salesforce/lwc-dev-server-dependencies/index.js'
            );

            jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);

            const server = new LocalDevServer();
            await server.start(project, mockConn);

            const expected = path.resolve(
                __dirname,
                '../../../virtual-modules/224'
            );

            expect(talonServer.createServer).not.toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything(),
                mockConn
            );

            jest.restoreAllMocks();
        });

        it('clears the outputDirectory', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();
            await server.start(project);

            const expected = path.join(projectPath, defaultOutputDirectory);

            expect(fileUtils.removeFile).toBeCalledWith(expected);
        });

        it('calls copyFiles from assets directory to outputDirectory', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();
            await server.start(project);

            const expectedSource = path.join(
                __dirname,
                '../../../dist/assets/*'
            );

            // without further configuration, LGC expects the SLDS icons dir to
            // be directly under 'assets' at the web root
            const expectedDest = path.join(
                projectPath,
                defaultOutputDirectory,
                'public',
                'assets'
            );

            expect(fileUtils.copyFiles).toBeCalledWith(
                expectedSource,
                expectedDest
            );
        });

        it('throws an error with expected message if copying assets fails', async () => {
            jest.spyOn(fileUtils, 'copyFiles').mockImplementation(() => {
                throw 'test error';
            });

            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();

            await expect(server.start(project)).rejects.toThrow(
                'error - unable to copy assets: test error'
            );
        });

        it('calls startServer with the correct port', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const port = 1337;
            const project = mockProject({ projectPath, port });

            const server = new LocalDevServer();
            await server.start(project);

            expect(talonServer.startServer).toBeCalledWith(
                expect.anything(),
                expect.anything(),
                port,
                expect.any(Function)
            );
        });

        it('rethrows errors from startServer with an identifying message', async () => {
            jest.spyOn(talonServer, 'startServer').mockImplementation(() => {
                throw 'test error';
            });

            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();

            await expect(server.start(project)).rejects.toThrow(
                'Unable to start LocalDevServer: test error'
            );
        });

        it('uses default apiVersion when apiVersion is not specified', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const port = 1337;
            const project = mockProject({
                projectPath,
                port,
                version: undefined
            });

            const server = new LocalDevServer();
            await server.start(project);

            const call = (talonServer.createServer as any).mock.calls[0];
            const proxyConfig = call[1];

            expect(proxyConfig.pathRewrite('/api/v100.0/')).toBe('/v45.0/');
        });

        it('adds custom components plugin when project is sfdx', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            Object.defineProperty(project, 'isSfdx', {
                get: () => {
                    return true;
                }
            });

            const server = new LocalDevServer();
            await server.start(project);

            const call = (talonServer.createServer as any).mock.calls[0];
            const config = call[0];

            expect(config.webruntimeConfig.rollup.plugins[0].name).toBe(
                'rollup-plugin-custom-components'
            );
        });

        it('adds salesforce apex wire resolver', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            Object.defineProperty(project, 'isSfdx', {
                get: () => {
                    return true;
                }
            });

            const server = new LocalDevServer();
            await server.start(project);

            const call = (talonServer.createServer as any).mock.calls[0];
            const config = call[0];

            expect(config.webruntimeConfig.rollup.plugins[1].name).toBe(
                'rollup-plugin-apex'
            );
        });

        it('adds /localdev/{{nonce}}/localdev.json route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });

            const server = new LocalDevServer();

            // @ts-ignore
            server.nonce = 'nonce';

            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const get = result.value.get;

            expect(get.mock.calls[0][0]).toBe('/localdev/nonce/localdev.json');
        });

        it('adds /localdev/{{nonce}}/localdev.js route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });

            const server = new LocalDevServer();

            // @ts-ignore
            server.nonce = 'nonce';

            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const get = result.value.get;

            expect(get.mock.calls[1][0]).toBe('/localdev/nonce/localdev.js');
        });

        it('adds /localdev/{{nonce}}/show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });

            const server = new LocalDevServer();

            // @ts-ignore
            server.nonce = 'nonce';

            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const get = result.value.get;

            expect(get.mock.calls[2][0]).toBe('/localdev/nonce/show');
        });

        it('returns project metadata for localdev.json route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            const modulesList: PackageComponent[] = [
                {
                    htmlName: 'ui-module',
                    jsName: 'ui/module',
                    namespace: 'ui',
                    name: 'module',
                    url: 'url',
                    path: 'path'
                }
            ];
            const projectData: ProjectMetadata = {
                projectName: 'test',
                packages: [
                    {
                        isDefault: true,
                        key: 'package1',
                        packageName: 'LWCRecipes',
                        components: modulesList
                    }
                ]
            };
            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[0][1];
            const response = {
                json: jest.fn()
            };
            // @ts-ignore
            ComponentIndex.mockImplementation(() => {
                return {
                    getModules: jest.fn(() => modulesList),
                    getProjectMetadata: jest.fn(() => projectData)
                };
            });

            routeHandler(jest.fn(), response, jest.fn());

            expect(response.json.mock.calls[0][0]).toEqual(projectData);
        });

        it('returns project metadata for localdev.js route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            const modulesList: PackageComponent[] = [
                {
                    htmlName: 'ui-module',
                    jsName: 'ui/module',
                    namespace: 'ui',
                    name: 'module',
                    url: 'url',
                    path: 'path'
                }
            ];
            const projectData: ProjectMetadata = {
                projectName: 'test',
                packages: [
                    {
                        isDefault: true,
                        key: 'package1',
                        packageName: 'LWCRecipes',
                        components: modulesList
                    }
                ]
            };
            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[1][1];
            const response = {
                type: jest.fn(),
                send: jest.fn()
            };
            // @ts-ignore
            ComponentIndex.mockImplementation(() => {
                return {
                    getModules: jest.fn(() => modulesList),
                    getProjectMetadata: jest.fn(() => projectData)
                };
            });

            routeHandler(jest.fn(), response, jest.fn());

            expect(response.type.mock.calls[0][0]).toEqual('js');

            const LocalDev = {
                project: projectData
            };
            const content = `window.LocalDev = ${JSON.stringify(LocalDev)};`;
            expect(response.send.mock.calls[0][0]).toEqual(content);
        });

        it('should send a file with allowed file extension for show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const modulesPath = '/mymodules';
            const project = mockProject({
                projectPath,
                modulesPath
            });

            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[2][1];

            const request = {
                query: {
                    file: '/mymodules/filename.html'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            routeHandler(request, response, jest.fn());

            expect(response.sendFile).toBeCalledTimes(1);
        });

        it('should not send a file from outside of the module path for show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const modulesPath = '/mymodules';
            const project = mockProject({
                projectPath,
                modulesPath
            });

            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[2][1];

            const request = {
                query: {
                    file: '/notmymodules/filename.ts'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            routeHandler(request, response, jest.fn());

            expect(response.sendFile).toBeCalledTimes(0);
        });

        it('should not send a file with relative path outside of module path for show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const modulesPath = '/mymodules';
            const project = mockProject({
                projectPath,
                modulesPath
            });

            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[2][1];

            const request = {
                query: {
                    file: '/mymodules/../filename.ts'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            routeHandler(request, response, jest.fn());

            expect(response.sendFile).toBeCalledTimes(0);
        });

        it('should not send a file with unallowed file extension for show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const modulesPath = '/mymodules';
            const project = mockProject({
                projectPath,
                modulesPath
            });

            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[2][1];

            const request = {
                query: {
                    file: '/mymodules/filename.ts'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            routeHandler(request, response, jest.fn());

            expect(response.sendFile).toBeCalledTimes(0);
        });

        it('should not send a file without a file extension for show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const modulesPath = '/mymodules';
            const project = mockProject({
                projectPath,
                modulesPath
            });

            const server = new LocalDevServer();
            await server.start(project);

            const result = (talonServer.createServer as any).mock.results[0];
            const routeHandler = result.value.get.mock.calls[2][1];

            const request = {
                query: {
                    file: '/mymodules/filename.ts'
                }
            };

            const response = {
                sendFile: jest.fn()
            };

            routeHandler(request, response, jest.fn());

            expect(response.sendFile).toBeCalledTimes(0);
        });

        describe('telemetry', () => {
            const MockReporter = {
                trackApplicationStart: jest.fn(),
                trackApplicationEnd: jest.fn(),
                trackApplicationStartException: jest.fn()
            };

            beforeEach(() => {
                jest.spyOn(LocalDevTelemetryReporter, 'getInstance')
                    // @ts-ignore
                    .mockImplementation(async () => MockReporter);
            });

            afterEach(() => {
                // @ts-ignore
                LocalDevTelemetryReporter.getInstance.mockClear();
            });

            it('reports on application start', async () => {
                const reporter = await LocalDevTelemetryReporter.getInstance(
                    'userid',
                    'sessionid'
                );
                jest.spyOn(reporter, 'trackApplicationStart');
                const projectPath = '/Users/arya/dev/myproject';
                const project = mockProject({
                    projectPath
                });

                const server = new LocalDevServer();
                await server.start(project);

                expect(reporter.trackApplicationStart).toBeCalledWith(
                    expect.any(Number),
                    expect.any(Boolean),
                    expect.any(String)
                );
            });

            it('reports on application end', async () => {
                const projectPath = '/Users/arya/dev/myproject';
                const project = mockProject({ projectPath });
                const reporter = await LocalDevTelemetryReporter.getInstance(
                    'userid',
                    'sessionid'
                );

                const server = new LocalDevServer();
                await server.start(project);

                const onEnd = (talonServer.startServer as any).mock.calls[0][3];
                onEnd();

                expect(reporter.trackApplicationEnd).toBeCalledWith(
                    expect.any(Number)
                );
            });

            it('reports when exception is thrown durning application start', async () => {
                const projectPath = '/Users/arya/dev/myproject';
                const project = mockProject({ projectPath });
                const reporter = await LocalDevTelemetryReporter.getInstance(
                    'userid',
                    'sessionid'
                );
                // Throw an exception during LocalDevServer start
                reporter.trackApplicationStart = jest
                    .fn()
                    .mockImplementationOnce(() => {
                        throw new Error('expected error');
                    });

                // Will throw an exception
                try {
                    const server = new LocalDevServer();
                    await server.start(project);
                } catch (e) {}

                expect(reporter.trackApplicationStartException).toBeCalledWith(
                    expect.any(Error)
                );
            });

            it('passes encoded devhubuser to instrumentation as userid', async () => {
                const projectPath = '/Users/arya/dev/myproject';
                const project = mockProject({ projectPath });
                const localDevServer = new LocalDevServer(
                    'devhubuser@salesforce.com'
                );
                // @ts-ignore
                localDevServer.anonymousUserId = 'anonymousUserId';

                localDevServer.start(project);

                expect(
                    // @ts-ignore
                    LocalDevTelemetryReporter.getInstance.mock.calls[0][0]
                ).toBe('anonymousUserId');
            });

            it('passes nonce to instrumentation as sessionid', async () => {
                const projectPath = '/Users/arya/dev/myproject';
                const project = mockProject({ projectPath });
                const localDevServer = new LocalDevServer(
                    'devhubuser@salesforce.com'
                );
                // @ts-ignore
                localDevServer.nonce = 'nonce';

                localDevServer.start(project);

                expect(
                    // @ts-ignore
                    LocalDevTelemetryReporter.getInstance.mock.calls[0][1]
                ).toBe('nonce');
            });

            it('serializes devhubuser ', async () => {
                const projectPath = '/Users/arya/dev/myproject';
                const project = mockProject({ projectPath });
                // jest.spyOn(LocalDevTelemetryReporter, 'getInstance')
                //     // @ts-ignore
                //     .mockImplementation(async () => MockReporter);

                const localDevServer = new LocalDevServer(
                    'devhubuser@salesforce.com'
                );
                localDevServer.start(project);

                expect(
                    // @ts-ignore
                    LocalDevTelemetryReporter.getInstance.mock.calls[0][0]
                ).not.toBe('devhubuser@salesforce.com');
            });
        });
    });

    describe('stop()', () => {
        const MockReporter = {
            trackApplicationStart: jest.fn(),
            trackApplicationEnd: jest.fn(),
            trackApplicationStartException: jest.fn()
        };

        beforeEach(() => {
            jest.spyOn(LocalDevTelemetryReporter, 'getInstance')
                // @ts-ignore
                .mockImplementation(async () => MockReporter);
        });

        afterEach(() => {
            // @ts-ignore
            LocalDevTelemetryReporter.getInstance.mockClear();
        });

        it('calls close on the server', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const mockServer = {
                close: jest.fn().mockImplementation(cb => {
                    cb();
                })
            };
            jest.spyOn(talonServer, 'startServer').mockResolvedValueOnce(
                mockServer
            );

            const server = new LocalDevServer();
            await server.start(project);
            await server.stop();

            expect(mockServer.close).toBeCalledTimes(1);
        });

        it('returns a rejected promise if server.close invokes the callback with an error', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const mockServer = {
                close: jest.fn().mockImplementation(cb => {
                    cb(new Error('test'));
                })
            };

            jest.spyOn(talonServer, 'startServer').mockResolvedValueOnce(
                mockServer
            );

            const server = new LocalDevServer();
            await server.start(project);

            expect(server.stop()).rejects.toEqual(new Error('test'));
            expect(mockServer.close).toBeCalledTimes(1);
        });

        it('does nothing if the server wasnt started', async () => {
            const server = new LocalDevServer();
            await server.stop();
            // no errors
        });
    });

    describe('port()', () => {
        const MockReporter = {
            trackApplicationStart: jest.fn(),
            trackApplicationEnd: jest.fn(),
            trackApplicationStartException: jest.fn()
        };

        beforeEach(() => {
            jest.spyOn(LocalDevTelemetryReporter, 'getInstance')
                // @ts-ignore
                .mockImplementation(async () => MockReporter);
        });

        afterEach(() => {
            // @ts-ignore
            LocalDevTelemetryReporter.getInstance.mockClear();
        });

        it('returns the port number', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            jest.spyOn(talonServer, 'startServer').mockResolvedValueOnce({
                close: jest.fn(),
                address: jest.fn().mockReturnValue({
                    port: 5151
                })
            });

            const server = new LocalDevServer();
            await server.start(project);

            expect(server.port).toBe(5151);
        });
    });

    describe('pathRewrite', () => {
        class RewriteExposedLocalDevServer extends LocalDevServer {
            public pathRewrite(version: string) {
                return super.pathRewrite(version);
            }
        }

        it('rewrites different api versions to the specified one', () => {
            const server = new RewriteExposedLocalDevServer();
            const rewriteFunction = server.pathRewrite('99.0');
            expect(
                rewriteFunction('/api/services/data/v47.0/ui-api/records')
            ).toBe('/services/data/v99.0/ui-api/records');
        });
    });

    describe('copyAssets', () => {
        class CopyAssetsExposedLocalDevServer extends LocalDevServer {
            public async copyAssets(project: Project, dest: string) {
                return super.copyAssets(project, dest);
            }
        }

        it('copies assets and "watches" them', async () => {
            const server = new CopyAssetsExposedLocalDevServer();
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });
            // @ts-ignore
            project.staticResourcesDirectory = os.tmpdir(); // FIXME use mock-fs

            await server.copyAssets(project, 'wat');
            expect(cpx.copy).toBeCalledTimes(1);
        });
    });
});

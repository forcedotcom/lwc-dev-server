import * as path from 'path';
import mockFs from 'mock-fs';
import LocalDevServer from '../LocalDevServer';
import Project from '../../common/Project';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';

jest.mock('@webruntime/server', () => {
    return {
        Server: jest.fn().mockImplementation(() => {
            return {
                initialize: jest.fn(() => {
                    return Promise.resolve();
                }),
                start: jest.fn(),
                shutdown: jest.fn(),
                app: {
                    get: jest.fn(),
                    use: jest.fn()
                }
            };
        })
    };
});

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

jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
jest.mock('../../common/ComponentIndex');

function mockProject({
    projectPath,
    modulesPath = 'src/modules',
    port = 3000,
    version = '45.0',
    liveReload = true
}: {
    projectPath: string;
    modulesPath?: string;
    port?: number;
    version?: string;
    liveReload?: boolean;
}): Project {
    // Some ts-ignores because mockImplementation doesn't exist on the class.
    const localDevServerConfigurationMock = new LocalDevServerConfiguration();

    localDevServerConfigurationMock.port = port;
    localDevServerConfigurationMock.api_version = version;
    localDevServerConfigurationMock.liveReload = liveReload;

    mockFs({
        'node_modules/@salesforce/lwc-dev-server-dependencies/vendors': {
            'dependencies-218': {},
            'dependencies-220': {},
            'dependencies-222': {},
            'dependencies-224': {}
        }
    });

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
    afterEach(() => {
        delete process.env.LOCALDEV_PORT;
        delete process.env.PROJECT_ROOT;
        delete process.env.LOCALDEV_VENDOR_VERSION;
        delete process.env.PROJECT_LWC_MODULES;

        mockFs.restore();
    });

    describe('constructor', () => {
        it('should export env variables for webruntime config', () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject'
            });

            new LocalDevServer(project);

            expect(process.env.LOCALDEV_PORT).toEqual('3000');
            expect(process.env.PROJECT_ROOT).toEqual(project.directory);
            expect(process.env.LOCALDEV_VENDOR_VERSION).toEqual('218');
            expect(process.env.PROJECT_NAMESPACE).toEqual('c');
            expect(process.env.PROJECT_LWC_MODULES).toEqual(
                path.join(project.modulesSourceDirectory, 'main', 'default')
            );
        });

        it('should fallback to the latest supported core version', () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject',
                version: '49.0'
            });

            new LocalDevServer(project);

            expect(process.env.LOCALDEV_VENDOR_VERSION).toEqual('224');
        });

        it('should pass the projectDir to the server', () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            const server = require('@webruntime/server').Server;
            server.mockClear();

            const localDevServer = new LocalDevServer(project);

            // @ts-ignore
            const result = server;

            expect(result).toBeCalledWith(
                expect.objectContaining({
                    projectDir: path.join(__dirname, '..', '..', '..')
                })
            );
        });
    });

    describe('initialize', () => {
        it('should initialize a webruntime server', async () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject'
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();

            // @ts-ignore
            const initialize = localDevServer.server.initialize;
            expect(initialize).toBeCalledTimes(1);
        });

        it('should register the locals provider', async () => {
            const res = {
                locals: {
                    sessionNonce: ''
                }
            };
            const next = () => {};
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });

            const localDevServer = new LocalDevServer(project);
            // @ts-ignore
            localDevServer.sessionNonce = 'sessionNonce';

            await localDevServer.initialize();

            // @ts-ignore
            const result = localDevServer.server.app.use.mock.calls[0][0];
            result(undefined, res, next);

            expect(res.locals.sessionNonce).toBe('sessionNonce');
        });

        it('adds /localdev/{{sessionNonce}}/localdev.js route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();

            // @ts-ignore
            const result = localDevServer.server.app.get.mock.calls[0][0];

            expect(result).toBe(
                // @ts-ignore
                `/localdev/${localDevServer.sessionNonce}/localdev.js`
            );
        });

        it('adds /localdev/{{sessionNonce}}/show route', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();

            // @ts-ignore
            const result = localDevServer.server.app.get.mock.calls[1][0];

            expect(result).toBe(
                // @ts-ignore
                `/localdev/${localDevServer.sessionNonce}/show`
            );
        });

        it('adds live reload', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            const reload = require('reload');
            reload.mockClear();

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();

            expect(reload).toBeCalledTimes(1);
            // @ts-ignore
            expect(reload).toBeCalledWith(localDevServer.server.app);
        });

        it('does not add live reload when not enabled', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath,
                liveReload: false
            });
            const reload = require('reload');
            reload.mockClear();

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();

            expect(reload).toBeCalledTimes(0);
        });

        it('starts a file watcher for live reload', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({
                projectPath
            });
            const reload = require('reload');
            reload.mockClear();
            const chokidar = require('chokidar');
            chokidar.watch.mockClear();

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();

            // the file watcher should be watching the LWR build metadata
            expect(chokidar.watch).toHaveBeenCalledTimes(1);
            expect(chokidar.watch).toHaveBeenCalledWith(
                path.join(
                    __dirname,
                    '..',
                    '..',
                    '..',
                    'cache-data',
                    'metadata.json'
                ),
                {
                    ignoreInitial: true
                }
            );

            const reloadReturned = await reload.mock.results[0].value;
            const watchResult = chokidar.watch.mock.results[0].value;
            const [watchEvent, watchCallback] = watchResult.on.mock.calls[0];

            watchCallback();

            // file change events should trigger a reload
            expect(watchEvent).toEqual('change');
            expect(reloadReturned.reload).toBeCalledTimes(1);
        });
    });

    describe('start', () => {
        it('should start a webruntime server', async () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject'
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.initialize();
            await localDevServer.start();

            // @ts-ignore
            const start = localDevServer.server.start;
            expect(start).toBeCalledTimes(1);
        });
    });

    describe('close', () => {
        it('should close the webruntime server', async () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject'
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.start();
            await localDevServer.initialize();
            await localDevServer.close();

            // @ts-ignore
            const shutdown = localDevServer.server.shutdown;
            expect(shutdown).toBeCalledTimes(1);
        });

        it('should close the file watcher', async () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject'
            });
            const reload = require('reload');
            reload.mockClear();
            const chokidar = require('chokidar');
            chokidar.watch.mockClear();

            const localDevServer = new LocalDevServer(project);

            await localDevServer.start();
            await localDevServer.initialize();
            await localDevServer.close();

            const watchResult = chokidar.watch.mock.results[0].value;
            expect(watchResult.close).toHaveBeenCalledTimes(1);
        });

        it('should close the live reload server', async () => {
            const project = mockProject({
                projectPath: '/Users/arya/dev/myproject'
            });
            const reload = require('reload');
            reload.mockClear();

            const localDevServer = new LocalDevServer(project);

            await localDevServer.start();
            await localDevServer.initialize();
            await localDevServer.close();

            const reloadReturned = await reload.mock.results[0].value;
            expect(reloadReturned.closeServer).toHaveBeenCalledTimes(1);
        });
    });
});

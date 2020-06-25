import { EventEmitter } from 'events';
import path from 'path';
import mockFs from 'mock-fs';
import LocalDevServer from '../LocalDevServer';
import Project from '../../common/Project';
import WebruntimeConfig from '../config/WebruntimeConfig';
import * as fileUtils from '../../common/fileUtils';
import LocalDevTelemetryReporter from '../../instrumentation/LocalDevTelemetryReporter';
import { ComponentServiceWithExclusions } from '../services/ComponentServiceWithExclusions';
import { getCustomComponentService } from '../services/CustomComponentService';
import { getLabelService } from '../services/LabelsService';
import colors from 'colors';
import { apexMiddleware } from '../extensions/apexMiddleware';
import { apiMiddleware } from '../extensions/apiMiddleware';
import { Connection } from '@salesforce/core';
import { mock } from 'ts-mockito';

const mockServerConstructor = jest.fn();
jest.mock('@webruntime/server', () => {
    return {
        Server: class MockServer extends EventEmitter {
            constructor(...args: any) {
                super(...args);
                mockServerConstructor(...args);
            }
            initialize() {}
            start() {}
            shutdown() {
                this.emit('shutdown');
            }
        },
        Container: jest.fn()
    };
});
jest.mock('../config/WebruntimeConfig');
jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
jest.mock('../../common/ComponentIndex');
jest.mock('../extensions/apexMiddleware');
jest.mock('../extensions/apiMiddleware');

describe('LocalDevServer', () => {
    let project: Project;
    let consoleLogMock: any;
    let consoleErrorMock: any;
    let fileUtilsCopyMock: any;
    let addMiddlewareMock: any;
    let addModulesMock: any;
    let addRoutesMock: any;
    let addServicesMock: any;
    const MockReporter = {
        trackApplicationStart: jest.fn(),
        trackApplicationEnd: jest.fn(),
        trackApplicationStartException: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        mockFs({
            'node_modules/@salesforce/lwc-dev-server-dependencies/vendors': {
                'dependencies-218': {},
                'dependencies-220': {},
                'dependencies-222': {},
                'dependencies-224': {}
            }
        });

        addMiddlewareMock = jest.fn();
        addModulesMock = jest.fn();
        addRoutesMock = jest.fn();
        addServicesMock = jest.fn();

        // @ts-ignore
        WebruntimeConfig.mockImplementation(() => {
            return {
                buildDir: 'Users/arya/dev/myproject/.localdevserver',
                server: {
                    resourceRoot: '/webruntime'
                },
                addMiddleware: addMiddlewareMock,
                addModules: addModulesMock,
                addRoutes: addRoutesMock,
                addServices: addServicesMock
            };
        });
        project = new Project('/Users/arya/dev/myproject');
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        fileUtilsCopyMock = jest
            .spyOn(fileUtils, 'copyFiles')
            .mockImplementation();
        jest.spyOn(LocalDevTelemetryReporter, 'getInstance')
            // @ts-ignore
            .mockImplementation(async () => MockReporter);
    });

    afterEach(() => {
        mockFs.restore();
        consoleLogMock.mockRestore();
        consoleErrorMock.mockRestore();
        fileUtilsCopyMock.mockRestore();
        // @ts-ignore
        LocalDevTelemetryReporter.getInstance.mockClear();
    });

    it('should create a webruntime server', () => {
        new LocalDevServer(project);

        expect(mockServerConstructor).toHaveBeenCalledTimes(1);
        expect(mockServerConstructor).toHaveBeenCalledWith(
            expect.objectContaining({
                config: expect.any(Object)
            })
        );
    });

    it('should create a session nonce', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.sessionNonce).toBeDefined();
    });

    it('should set the vendor version', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.vendorVersion).toEqual('218');
    });

    it('should fallback to latest available vendor version', () => {
        project.configuration.api_version = '52.0';

        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.vendorVersion).toEqual('224');
    });

    it('should add middleware to the config', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(addMiddlewareMock).toHaveBeenCalledTimes(1);
    });

    it('should add routes to the config', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.config.addRoutes).toHaveBeenCalledTimes(1);
    });

    it('should add the live reload route when the configuration is true', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        const routes = server.config.addRoutes.mock.calls[0][0];

        expect(routes).toHaveLength(2);

        // @ts-ignore
        expect(server.liveReload).toBeDefined();
    });

    it('should not add the live reload route when the configuration is false', () => {
        project.configuration.liveReload = false;

        const server = new LocalDevServer(project);

        // @ts-ignore
        const routes = server.config.addRoutes.mock.calls[0][0];

        expect(routes).toHaveLength(1);

        // @ts-ignore
        expect(server.liveReload).toBeUndefined();
    });

    it('should not add apex middleware when connection is not present', () => {
        new LocalDevServer(project);
        expect(apexMiddleware).toBeCalledTimes(0);
    });

    it('should add apex middleware when connection is available', () => {
        const connection: Connection = mock(Connection);
        new LocalDevServer(project, connection);
        expect(apexMiddleware).toBeCalledTimes(1);
    });

    it('should not add api middleware when connection is not present', () => {
        new LocalDevServer(project);
        expect(apiMiddleware).toBeCalledTimes(0);
    });

    it('should add api middleware when connection is available', () => {
        const connection: Connection = mock(Connection);
        new LocalDevServer(project, connection);
        expect(apiMiddleware).toBeCalledTimes(1);
    });

    it('should add modules with the correct vendor version to the config', () => {
        const server = new LocalDevServer(project);

        expect(addModulesMock).toHaveBeenCalledTimes(2);

        const modules = addModulesMock.mock.calls[0][0];

        expect(modules).toEqual([
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/lightning-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/force-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/connect-gen-pkg'
        ]);
    });

    it('should add custom component service for sfdx projects', () => {
        // @ts-ignore
        project.isSfdx = true;

        new LocalDevServer(project);

        // @ts-ignore
        expect(addServicesMock).toHaveBeenCalledTimes(1);
    });

    it('should not add custom component service for sfdx projects', () => {
        // @ts-ignore
        project.isSfdx = false;

        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(addServicesMock.mock.calls[0][0]).not.toContain(
            getCustomComponentService('', '')
        );
    });

    it('should add the modulesSourceDirectory for non-sfdx modules', () => {
        // @ts-ignore
        project.isSfdx = false;

        new LocalDevServer(project);

        expect(addModulesMock).toHaveBeenCalledTimes(2);

        const modules = addModulesMock.mock.calls[1][0];

        expect(modules).toEqual([project.modulesSourceDirectory]);
    });

    it('copies app static assets to the server assets directory', async () => {
        const server = new LocalDevServer(project);
        // @ts-ignore
        server.config.buildDir = path.join(
            project.directory,
            '.localdevserver'
        );

        await server.start();

        const copiedFromPath = path.join(__dirname, '../../../dist/assets/*');

        const copiedToPath = path.join(
            // @ts-ignore
            server.config.buildDir,
            'assets',
            'localdev'
        );

        expect(fileUtils.copyFiles).toBeCalledWith(
            copiedFromPath,
            copiedToPath
        );
    });

    it('throws an error if copying static assets fails', async () => {
        fileUtilsCopyMock.mockImplementation(() => {
            throw new Error('test error');
        });

        const server = new LocalDevServer(project);
        // @ts-ignore
        server.config.buildDir = path.join(
            project.directory,
            '.localdevserver'
        );

        await expect(server.start()).rejects.toThrow(
            'Unable to copy dist assets: test error'
        );
    });

    it('prints server up message on start', async () => {
        const expected = colors.magenta.bold(
            `Server up on http://localhost:${3333}`
        );
        const server = new LocalDevServer(project);
        Object.defineProperty(server, 'ux', {
            get: () => {
                return { log: consoleLogMock, error: consoleErrorMock };
            }
        });
        jest.spyOn(server, 'serverPort', 'get').mockReturnValue(3333);

        await server.start();

        expect(consoleLogMock.mock.calls[0][0]).toEqual(expected);
        expect(consoleErrorMock.mock.calls[0]).toBeUndefined();
    });

    it('do not print server up message if server port is undefined', async () => {
        const expected = 'Server start up failed.';
        const server = new LocalDevServer(project);
        Object.defineProperty(server, 'ux', {
            get: () => {
                return { log: consoleLogMock, error: consoleErrorMock };
            }
        });
        jest.spyOn(server, 'serverPort', 'get').mockReturnValue(undefined);

        await server.start();

        expect(consoleLogMock.mock.calls[0]).toBeUndefined();
        expect(consoleErrorMock.mock.calls[0][0]).toEqual(expected);
    });

    describe('services added to the LocalDevServer', () => {
        it('should add the ComponentServiceWithExclusions', async () => {
            const server = new LocalDevServer(project);

            expect(
                // @ts-ignore
                server.config.addServices.mock.calls[0][0]
            ).toContain(ComponentServiceWithExclusions);
        });

        it('should add the ComponentServiceWithExclusions when project isSFDX', async () => {
            // @ts-ignore
            project.isSfdx = true;

            const server = new LocalDevServer(project);

            expect(
                // @ts-ignore
                server.config.addServices.mock.calls[0][0]
            ).toContain(ComponentServiceWithExclusions);
        });

        it('should add the CustomComponentService when project isSFDX', async () => {
            // @ts-ignore
            project.isSfdx = true;

            const componentService = getCustomComponentService('', '');
            const server = new LocalDevServer(project);
            // @ts-ignore
            const serviceNames = server.config.addServices.mock.calls[0][0].map(
                (service: Function) => service.name
            );

            expect(serviceNames).toContain(componentService.name);
        });

        it('should not add the CustomComponentService when the project is not isSFDX', async () => {
            // @ts-ignore
            project.isSfdx = false;

            const componentService = getCustomComponentService('', '');
            const server = new LocalDevServer(project);
            // @ts-ignore
            const serviceNames = server.config.addServices.mock.calls[0][0].map(
                (service: Function) => service.name
            );

            expect(serviceNames).not.toContain(componentService.name);
        });

        it('should add the LabelService when a customLabelsPath is specified', async () => {
            // @ts-ignore
            project.isSfdx = true;
            // @ts-ignore
            project.customLabelsPath = 'my/labelsFile.xml';

            const LabelService = getLabelService('my/labelFile.xml');
            const server = new LocalDevServer(project);
            // @ts-ignore
            const serviceNames = server.config.addServices.mock.calls[0][0].map(
                (service: Function) => service.name
            );

            expect(serviceNames).toContain(LabelService.name);
        });

        it('should add the LabelService when a customLabelsPath is specified in non sfdx project', async () => {
            // @ts-ignore
            project.isSfdx = false;
            // @ts-ignore
            project.customLabelsPath = 'my/labelsFile.xml';

            const LabelService = getLabelService('my/labelFile.xml');
            const server = new LocalDevServer(project);
            // @ts-ignore
            const serviceNames = server.config.addServices.mock.calls[0][0].map(
                (service: Function) => service.name
            );

            expect(serviceNames).toContain(LabelService.name);
        });

        it('should add the LabelService when a customLabelsPath is not specified', async () => {
            const LabelService = getLabelService('my/labelFile.xml');
            const server = new LocalDevServer(project);
            // @ts-ignore
            const serviceNames = server.config.addServices.mock.calls[0][0].map(
                (service: Function) => service.name
            );
            expect(serviceNames).toContain(LabelService.name);
        });
    });

    describe('start', () => {
        it('should call webruntime server start', async () => {
            const server = new LocalDevServer(project);

            const mockStart = jest.spyOn(server, 'start');

            await server.start();

            expect(mockStart).toBeCalledTimes(1);
        });
    });

    describe('shutdown', () => {
        it('should call webruntime server start', async () => {
            const server = new LocalDevServer(project);

            const mockShutdown = jest.spyOn(server, 'shutdown');

            await server.shutdown();

            expect(mockShutdown).toBeCalledTimes(1);
        });

        it('should close live reload', async () => {
            const server = new LocalDevServer(project);

            // @ts-ignore
            const mockClose = jest.spyOn(server.liveReload, 'close');

            await server.shutdown();

            expect(mockClose).toBeCalledTimes(1);
        });
    });

    describe('telemetry', () => {
        it('reports on application start', async () => {
            const reporter = await LocalDevTelemetryReporter.getInstance(
                'sessionid'
            );
            jest.spyOn(reporter, 'trackApplicationStart');
            const connection: Connection = mock(Connection);
            const server = new LocalDevServer(project, connection);
            await server.start();

            expect(reporter.trackApplicationStart).toBeCalledWith(
                expect.any(Number),
                expect.any(String)
            );
        });

        it('reports on application end', async () => {
            const reporter = await LocalDevTelemetryReporter.getInstance(
                'sessionid'
            );
            const connection: Connection = mock(Connection);
            const server = new LocalDevServer(project, connection);

            await server.start();
            await server.shutdown();

            expect(reporter.trackApplicationEnd).toBeCalledWith(
                expect.any(Number)
            );
        });

        it('reports when exception is thrown durning application start', async () => {
            const reporter = await LocalDevTelemetryReporter.getInstance(
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
                const connection: Connection = mock(Connection);
                const server = new LocalDevServer(project, connection);
                await server.start();
            } catch (e) {}

            expect(reporter.trackApplicationStartException).toBeCalledWith(
                expect.any(Error)
            );
        });

        it('passes nonce to instrumentation as sessionid', async () => {
            const connection: Connection = mock(Connection);
            const server = new LocalDevServer(project, connection);
            // @ts-ignore
            server.sessionNonce = 'nonce';
            await server.start();
            expect(
                // @ts-ignore
                LocalDevTelemetryReporter.getInstance.mock.calls[0][0]
            ).toBe('nonce');
        });
    });
});

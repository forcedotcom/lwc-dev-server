/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

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
import { ServerConfiguration } from '../../common/types';

const mockServerConstructor = jest.fn();
const SRV_CONFIG: ServerConfiguration = {
    apiVersion: '49.0',
    instanceUrl: 'http://test.instance.url',
    headers: ['Authorization: Bearer testingAccessToken']
};
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
    let consoleWarnMock: any;
    let fileUtilsCopyMock: any;
    let findLWCFolderPathMock: any;
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
                'dependencies-228': {},
                'dependencies-226': {},
                'dependencies-224': {},
                'dependencies-222': {}
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
                serverDir: path.join(__dirname, '..', '..', '..'),
                server: {
                    resourceRoot: '/webruntime'
                },
                addMiddleware: addMiddlewareMock,
                addModules: addModulesMock,
                addRoutes: addRoutesMock,
                addServices: addServicesMock
            };
        });
        project = new Project('/Users/arya/dev/myproject', SRV_CONFIG);
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
        fileUtilsCopyMock = jest
            .spyOn(fileUtils, 'copyFiles')
            .mockImplementation();
        jest.spyOn(LocalDevTelemetryReporter, 'getInstance').mockReturnValue(
            // @ts-ignore
            MockReporter
        );

        findLWCFolderPathMock = jest
            .spyOn(fileUtils, 'findLWCFolderPath')
            .mockImplementation();
    });

    afterEach(() => {
        mockFs.restore();
        consoleLogMock.mockRestore();
        consoleErrorMock.mockRestore();
        consoleWarnMock.mockRestore();
        fileUtilsCopyMock.mockRestore();
        findLWCFolderPathMock.mockRestore();
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
        expect(server.vendorVersion).toEqual('228');
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

        expect(addModulesMock).toHaveBeenCalledTimes(1);

        const modules = addModulesMock.mock.calls[0][0];

        expect(modules).toEqual([
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-228/lightning-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-228/lightning-stub-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-228/force-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-228/connect-gen-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-226/lightning-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-226/force-pkg',
            '@salesforce/lwc-dev-server-dependencies/vendors/dependencies-226/connect-gen-pkg'
        ]);
    });

    it('should show a warning when lwc folder is not present for sfdx projects', () => {
        findLWCFolderPathMock.mockImplementation(() => {
            return undefined;
        });

        new LocalDevServer(project);

        // @ts-ignore
        expect(addServicesMock).toHaveBeenCalledTimes(1);
        expect(consoleWarnMock.mock.calls[0][0]).toEqual(
            `No 'lwc' directory found in path ${project.modulesSourceDirectory}`
        );
    });

    it('should add custom component service for sfdx projects', () => {
        findLWCFolderPathMock.mockImplementation(() => {
            return path.join(project.modulesSourceDirectory, 'lwc');
        });

        new LocalDevServer(project);

        // @ts-ignore
        expect(addServicesMock).toHaveBeenCalledTimes(1);
    });

    it('should not add custom component service for sfdx projects', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(addServicesMock.mock.calls[0][0]).not.toContain(
            getCustomComponentService('', '', '')
        );
    });

    it.skip('delete assets directory before creating a new one to clear cache', async () => {
        const server = new LocalDevServer(project);
        // @ts-ignore
        server.config.buildDir = path.join(
            project.projectDirectory,
            '.localdevserver'
        );

        await server.start();

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(fileUtils.removeFile.mock.calls[0][0]).toEqual(
            // @ts-ignore
            server.config.buildDir
        );
    });

    it('copies app static assets to the server assets directory', async () => {
        const server = new LocalDevServer(project);
        // @ts-ignore
        server.config.buildDir = path.join(
            project.projectDirectory,
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
            project.projectDirectory,
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

        it('should add the ComponentServiceWithExclusions when project is SalesforceDX', async () => {
            findLWCFolderPathMock.mockImplementation(() => {
                return path.join(project.modulesSourceDirectory, 'lwc');
            });
            const server = new LocalDevServer(project);

            expect(
                // @ts-ignore
                server.config.addServices.mock.calls[0][0]
            ).toContain(ComponentServiceWithExclusions);
        });

        it('should add the CustomComponentService when project is SalesforceDX', async () => {
            findLWCFolderPathMock.mockImplementation(() => {
                return path.join(project.modulesSourceDirectory, 'lwc');
            });
            const componentService = getCustomComponentService('', '', '');
            const server = new LocalDevServer(project);
            // @ts-ignore
            const serviceNames = server.config.addServices.mock.calls[0][0].map(
                (service: Function) => service.name
            );

            expect(serviceNames).toContain(componentService.name);
        });

        it('should add the LabelService when a customLabelsPath is specified', async () => {
            findLWCFolderPathMock.mockImplementation(() => {
                return path.join(project.modulesSourceDirectory, 'lwc');
            });
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
            const reporter = LocalDevTelemetryReporter.getInstance();
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
            const reporter = LocalDevTelemetryReporter.getInstance();
            const connection: Connection = mock(Connection);
            const server = new LocalDevServer(project, connection);

            await server.start();
            await server.shutdown();

            expect(reporter.trackApplicationEnd).toBeCalledWith(
                expect.any(Number)
            );
        });

        it('reports when exception is thrown durning application start', async () => {
            const reporter = LocalDevTelemetryReporter.getInstance();
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
    });
});

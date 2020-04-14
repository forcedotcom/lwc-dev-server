import path from 'path';
import mockFs from 'mock-fs';
import { Server, Container } from '@webruntime/server';
import LocalDevServer from '../LocalDevServer';
import Project from '../../common/Project';
import WebruntimeConfig from '../config/WebruntimeConfig';
import * as fileUtils from '../../common/fileUtils';
import { ComponentServiceWithExclusions } from '../services/ComponentServiceWithExclusions';
import { getCustomComponentService } from '../services/CustomComponentService';
import { getLabelService } from '../services/LabelsService';

jest.mock('@webruntime/server');
jest.mock('../config/WebruntimeConfig');
jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
jest.mock('../../common/ComponentIndex');

describe('LocalDevServer', () => {
    let project: Project;

    beforeEach(() => {
        // @ts-ignore
        WebruntimeConfig.mockClear();
        // @ts-ignore
        Server.mockClear();
        // @ts-ignore
        Container.mockClear();

        mockFs({
            'node_modules/@salesforce/lwc-dev-server-dependencies/vendors': {
                'dependencies-218': {},
                'dependencies-220': {},
                'dependencies-222': {},
                'dependencies-224': {}
            }
        });

        // @ts-ignore
        WebruntimeConfig.mockImplementation(() => {
            return {
                buildDir: 'Users/arya/dev/myproject/.localdevserver',
                addMiddleware: jest.fn(),
                addModules: jest.fn(),
                addRoutes: jest.fn(),
                addServices: jest.fn()
            };
        });
        project = new Project('/Users/arya/dev/myproject');
    });

    afterEach(() => {
        mockFs.restore();
    });

    it('should create a default LWR server', () => {
        new LocalDevServer(project);

        expect(Server).toHaveBeenCalledTimes(1);

        // @ts-ignore
        const args = Server.mock.calls[0][0];
        expect(args).toBeUndefined();
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
        expect(server.config.addMiddleware).toHaveBeenCalledTimes(1);
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

    it('should add modules with the correct vendor version to the config', () => {
        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.config.addModules).toHaveBeenCalledTimes(1);

        // @ts-ignore
        const modules = server.config.addModules.mock.calls[0][0];

        expect(modules).toEqual([
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/force-pkg`
        ]);
    });

    it('should add custom component service for sfdx projects', () => {
        // @ts-ignore
        project.isSfdx = true;

        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.config.addServices).toHaveBeenCalledTimes(1);
    });

    it('should not add custom component service for sfdx projects', () => {
        // @ts-ignore
        project.isSfdx = false;

        const server = new LocalDevServer(project);

        // @ts-ignore
        expect(server.config.addServices.mock.calls[0][0]).not.toContain(
            getCustomComponentService('', '')
        );
    });

    it('should override the default config', () => {
        const localDevServer = new LocalDevServer(project);
        const lwrServer = new Server();

        // override the options and config
        // @ts-ignore
        expect(lwrServer.options).not.toEqual(localDevServer.options);
        // @ts-ignore
        expect(lwrServer.config).not.toEqual(localDevServer.config);

        // create a new container with the updated config
        expect(Container).toHaveBeenCalledTimes(1);
    });

    it('copies app static assets to the server assets directory', async () => {
        const server = new LocalDevServer(project);
        // @ts-ignore
        server.config.buildDir = path.join(
            project.directory,
            '.localdevserver'
        );

        await server.initialize();

        const copiedFromPath = path.join(__dirname, '../../../dist/assets/*');
        // @ts-ignore
        const copiedToPath = path.join(server.config.buildDir, 'assets');

        expect(fileUtils.copyFiles).toBeCalledWith(
            copiedFromPath,
            copiedToPath
        );
    });

    it('should handle graceful shutdown (SIGTERM)', async () => {
        const server = new LocalDevServer(project);
        const mockShutdown = jest.spyOn(server, 'shutdown');
        const mockExit = jest.spyOn(process, 'exit');
        // @ts-ignore
        mockExit.mockImplementation(() => {});

        await server.initialize();
        process.emit('SIGTERM', 'SIGTERM');

        expect(mockExit).toBeCalled();
        expect(mockShutdown).toHaveBeenCalledTimes(1);
    });

    it('should handle graceful shutdown (SIGINT)', async () => {
        const server = new LocalDevServer(project);
        const mockShutdown = jest.spyOn(server, 'shutdown');
        const mockExit = jest.spyOn(process, 'exit');
        // @ts-ignore
        mockExit.mockImplementation(() => {});

        await server.initialize();
        process.emit('SIGINT', 'SIGINT');

        expect(mockExit).toBeCalled();
        expect(mockShutdown).toHaveBeenCalledTimes(1);
    });

    it('throws an error if copying static assets fails', async () => {
        jest.spyOn(fileUtils, 'copyFiles').mockImplementation(() => {
            throw new Error('test error');
        });

        const server = new LocalDevServer(project);
        // @ts-ignore
        server.config.buildDir = path.join(
            project.directory,
            '.localdevserver'
        );

        await expect(server.initialize()).rejects.toThrow(
            'Unable to copy assets: test error'
        );
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

    describe('shutdown', () => {
        it('should close live reload', async () => {
            const server = new LocalDevServer(project);

            // @ts-ignore
            const mockClose = jest.spyOn(server.liveReload, 'close');

            await server.shutdown();

            expect(mockClose).toBeCalledTimes(1);
        });
    });
});

import mockFs from 'mock-fs';
import { Server, Container } from '@webruntime/server';
import LocalDevServer from '../LocalDevServer';
import Project from '../../common/Project';
import WebruntimeConfig from '../config/WebruntimeConfig';

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

        project = new Project('/Users/arya/dev/myproject');
    });

    afterEach(() => {
        mockFs.restore();
    });

    it('should create a default LWR server', () => {
        new LocalDevServer(project);

        expect(Server).toHaveBeenCalledTimes(1);

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

        expect(server.config.addMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should add routes to the config', () => {
        const server = new LocalDevServer(project);

        expect(server.config.addRoutes).toHaveBeenCalledTimes(1);
    });

    it('should add modules with the correct vendor version to the config', () => {
        const server = new LocalDevServer(project);

        expect(server.config.addModules).toHaveBeenCalledTimes(1);

        const modules = server.config.addModules.mock.calls[0][0];

        expect(modules).toEqual([
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-218/force-pkg`
        ]);
    });

    it('should add compiler plugins to the config', () => {
        const server = new LocalDevServer(project);

        expect(server.config.addPlugins).toHaveBeenCalledTimes(1);
    });

    it('should override the default config', () => {
        const localDevServer = new LocalDevServer(project);
        const lwrServer = new Server();

        // override the options and config
        expect(lwrServer.options).not.toEqual(localDevServer.options);
        expect(lwrServer.config).not.toEqual(localDevServer.config);

        // create a new container with the updated config
        expect(Container).toHaveBeenCalledTimes(1);
    });
});

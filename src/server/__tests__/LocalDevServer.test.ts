import * as path from 'path';
import LocalDevServer from '../LocalDevServer';
import Project from '../../common/Project';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';

const initialize = jest.fn(() => {
    return Promise.resolve();
});

const start = jest.fn();
const shutdown = jest.fn();

jest.mock('@webruntime/server', () => {
    return {
        Server: jest.fn().mockImplementation(() => {
            return {
                initialize,
                start,
                shutdown
            };
        })
    };
});

jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
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
    jest.spyOn(
        localDevServerConfigurationMock,
        'core_version',
        'get'
    ).mockReturnValue('218');

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
        initialize.mockClear();
        start.mockClear();
    });

    afterEach(() => {
        delete process.env.LOCALDEV_PORT;
        delete process.env.PROJECT_ROOT;
        delete process.env.PROJECT_CORE_VERSION;
        delete process.env.PROJECT_LWC_MODULES;
    });

    describe('constructor', () => {
        it('should export env variables for webruntime config', () => {
            const project = mockProject({
                projectPath: '/path/to/project'
            });

            new LocalDevServer(project);

            expect(process.env.LOCALDEV_PORT).toEqual('3000');
            expect(process.env.PROJECT_ROOT).toEqual(project.directory);
            expect(process.env.PROJECT_CORE_VERSION).toEqual('218');
            expect(process.env.PROJECT_NAMESPACE).toEqual('c');
            expect(process.env.PROJECT_LWC_MODULES).toEqual(
                path.join(project.modulesSourceDirectory, 'main', 'default')
            );
        });
    });

    describe('start', () => {
        it('should start a webruntime server', async () => {
            const project = mockProject({
                projectPath: '/path/to/project'
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.start();

            expect(initialize).toBeCalledTimes(1);
            expect(start).toBeCalledTimes(1);
        });
    });

    describe('close', () => {
        it('should close the webruntime server', async () => {
            const project = mockProject({
                projectPath: '/path/to/project'
            });

            const localDevServer = new LocalDevServer(project);

            await localDevServer.start();

            expect(initialize).toBeCalledTimes(1);
            expect(start).toBeCalledTimes(1);

            await localDevServer.close();

            expect(shutdown).toBeCalledTimes(1);
        });
    });
});

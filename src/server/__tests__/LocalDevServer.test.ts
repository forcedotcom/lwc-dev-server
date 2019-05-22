import path from 'path';
import LocalDevServer, { defaultOutputDirectory } from '../LocalDevServer';
import Project from '../../common/Project';
import * as fileUtils from '../../common/fileUtils';
import * as talonServer from '../talonServerCopy';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';

jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
jest.mock('../talonServerCopy');

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
        jest.spyOn(talonServer, 'createServer').mockImplementation(
            (): any => {
                return {
                    start: jest.fn(),
                    use: jest.fn()
                };
            }
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('start()', () => {
        it('specifies the outputDirectory in the talon server configuration', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();
            await server.start(project);

            const expected = path.join(projectPath, defaultOutputDirectory);

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    outputDir: expected
                }),
                expect.anything()
            );
        });

        it('configures the modulePaths with the localdevserver modules', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();
            await server.start(project);

            const expected = path.resolve(__dirname, '../../../');

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything()
            );
        });

        it('configures the modulePaths with the matching version resources directory', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath, version: '45.0' });

            const server = new LocalDevServer();
            await server.start(project);

            const expected = path.resolve(
                __dirname,
                '../../../vendors/dependencies-218'
            );

            expect(talonServer.createServer).toBeCalledWith(
                expect.objectContaining({
                    modulePaths: expect.arrayContaining([expected])
                }),
                expect.anything()
            );
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
            const expectedDest = `${projectPath}/${defaultOutputDirectory}/public/assets`;

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
                port
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
    });
});

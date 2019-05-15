import path from 'path';
import LocalDevServer, { defaultOutputDirectory } from '../LocalDevServer';
import Project from '../..//common/Project';
import { copyFiles, removeFile } from '../../common/fileUtils';
import { createServer, startServer } from '../talonServerCopy';

jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');
jest.mock('../talonServerCopy', () => {
    return {
        createServer: jest.fn().mockImplementation(() => {
            return {
                start: jest.fn(),
                use: jest.fn()
            };
        }),
        startServer: jest.fn()
    };
});

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
    const project = new Project(projectPath);

    project.getConfiguration = jest.fn().mockImplementation(() => {
        return {
            port
        };
    });

    project.getSfdxConfiguration = jest.fn().mockImplementation(() => {
        return {
            getPath: () => projectPath,
            get api_version() {
                return version;
            }
        };
    });

    project.getModuleSourceDirectory = jest
        .fn()
        .mockImplementation(() => modulesPath);

    return project;
}

describe('LocalDevServer', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('start()', () => {
        it('specifies the outputDirectory in the talon server configuration', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const project = mockProject({ projectPath });

            const server = new LocalDevServer();
            await server.start(project);

            const expected = path.join(projectPath, defaultOutputDirectory);

            expect(createServer).toBeCalledWith(
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

            expect(createServer).toBeCalledWith(
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

            expect(createServer).toBeCalledWith(
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

            expect(removeFile).toBeCalledWith(expected);
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

            expect(copyFiles).toBeCalledWith(expectedSource, expectedDest);
        });

        it('calls startServer with the correct port', async () => {
            const projectPath = '/Users/arya/dev/myproject';
            const port = 1337;
            const project = mockProject({ projectPath, port });

            const server = new LocalDevServer();
            await server.start(project);

            expect(startServer).toBeCalledWith(
                expect.anything(),
                expect.anything(),
                port
            );
        });
    });
});

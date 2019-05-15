import LocalDevServer from '../LocalDevServer';
import Project from '../..//common/Project';
import { copyFiles } from '../../common/fileUtils';
import path from 'path';

jest.mock('../talonServerCopy');
jest.mock('../../common/Project');
jest.mock('../../common/fileUtils');

describe('LocalDevServer.ts', () => {
    describe('the #start method', () => {
        it('copies all assets to the outputDirectory', async () => {
            const projectPath = '/Users/arya/dev/myproject';

            const project = new Project();
            project.getSfdxConfiguration = jest.fn().mockImplementation(() => {
                return {
                    getPath: () => projectPath,
                    apiVersion: 45
                };
            });
            project.getConfiguration = jest.fn().mockImplementation(() => {
                return {
                    port: 3000
                };
            });
            project.getModuleSourceDirectory = jest
                .fn()
                .mockImplementation(() => 'src/modules');

            const server = new LocalDevServer();
            await server.start(project);

            const expectedSource = path.join(
                __dirname,
                '../../../dist/assets/*'
            );
            const expectedDest = `${projectPath}/.localdevserver/public/assets`;
            expect(copyFiles).toBeCalledWith(expectedSource, expectedDest);
        });
    });
});

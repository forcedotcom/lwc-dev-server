import path from 'path';
import * as StaticResourcesUtils from '../StaticResourcesUtils';
import Project from '../Project';
import WebruntimeConfig from '../../server/config/WebruntimeConfig';
import * as fileUtils from '../fileUtils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from '../Constants';

jest.mock('../Project');
jest.mock('../fileUtils');

describe('StaticResourcesUtils', () => {
    let project: Project;
    let config: WebruntimeConfig;

    let fileUtilsCopyMock: any;
    let fileUtilsDeleteMock: any;

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject');
        config = new WebruntimeConfig(project);

        fileUtilsCopyMock = jest
            .spyOn(fileUtils, 'copyFiles')
            .mockImplementation();
        fileUtilsDeleteMock = jest
            .spyOn(fileUtils, 'removeFile')
            .mockImplementation();
    });

    afterEach(() => {
        fileUtilsCopyMock.mockRestore();
        fileUtilsDeleteMock.mockRestore();
    });

    it('copyDistAssets copies dist assets to configuration build directory', () => {
        StaticResourcesUtils.copyDistAssets(config);

        const copiedFromPath = path.join(
            config.serverDir,
            'dist',
            'assets',
            '*'
        );
        const copiedToPath = path.join(config.buildDir, 'assets', 'localdev');

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toBeCalledWith(
            copiedFromPath,
            copiedToPath
        );
    });

    it('copyStaticResources copies static resources to configuration build directory', () => {
        StaticResourcesUtils.copyStaticResources(project, config);

        const copiedFromPaths = project.staticResourcesDirectories;
        const copiedTo = path.join(
            config.buildDir,
            'assets',
            'project',
            STATIC_RESOURCES
        );

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(2);
        expect(fileUtils.copyFiles).nthCalledWith(
            1,
            path.join(copiedFromPaths[0], '*'),
            copiedTo
        );
        expect(fileUtils.copyFiles).nthCalledWith(
            2,
            path.join(copiedFromPaths[1], '*'),
            copiedTo
        );
    });

    it('copyContentAssets copies content assets to configuration build directory', () => {
        StaticResourcesUtils.copyContentAssets(project, config);

        const copiedFromPath = path.join(
            project.contentAssetsDirectory || '',
            '*'
        );
        const copiedTo = path.join(
            config.buildDir,
            'assets',
            'project',
            CONTENT_ASSETS
        );

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledWith(
            copiedFromPath,
            copiedTo
        );
    });

    it('rebuildResource copies static resources to configuration build directory', () => {
        StaticResourcesUtils.rebuildResource(project, config, 'src/staticResourceOne/mySampleFile.txt');

        const copiedFromPaths = project.staticResourcesDirectories;
        const copiedTo = path.join(
            config.buildDir,
            'assets',
            'project',
            STATIC_RESOURCES
        );

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(2);
        expect(fileUtils.copyFiles).nthCalledWith(
            1,
            path.join(copiedFromPaths[0], '*'),
            copiedTo
        );
        expect(fileUtils.copyFiles).nthCalledWith(
            2,
            path.join(copiedFromPaths[1], '*'),
            copiedTo
        );
    });
});

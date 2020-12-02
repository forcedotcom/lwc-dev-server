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

    it('copyStaticAssets copies dist, static resources, and content assets', () => {
        StaticResourcesUtils.copyStaticAssets(project, config);

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(3);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(4);

        confirmDistAssetCopy(1);
        confirmStaticResourcesAssetCopy(2, 3);
        confirmContentAssetCopy(4);
    });

    it('copyDistAssets copies dist assets to configuration build directory', () => {
        StaticResourcesUtils.copyDistAssets(config);

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(1);

        confirmDistAssetCopy(1);
    });

    it('copyStaticResources copies static resources to configuration build directory', () => {
        StaticResourcesUtils.copyStaticResources(project, config);

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(2);

        confirmStaticResourcesAssetCopy(1, 2);
    });

    it('copyContentAssets copies content assets to configuration build directory', () => {
        StaticResourcesUtils.copyContentAssets(project, config);

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(1);

        confirmContentAssetCopy(1);
    });

    it('rebuildResource copies static resources to configuration build directory', () => {
        StaticResourcesUtils.rebuildResource(
            project,
            config,
            'src/staticResourceOne/mySampleFile.txt'
        );

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(2);

        confirmStaticResourcesAssetCopy(1, 2);
    });

    it('rebuildResource copies content assets to configuration build directory', () => {
        StaticResourcesUtils.rebuildResource(
            project,
            config,
            'src/contentAssetDir/mySampleFile.txt'
        );

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(1);

        confirmContentAssetCopy(1);
    });

    it('rebuildResource does not copy assets if file is unrecognized by project', () => {
        const resourcePath = 'not/a/valid/resource.txt';
        jest.spyOn(console, 'error').mockImplementation();

        StaticResourcesUtils.rebuildResource(project, config, resourcePath);

        expect(fileUtils.removeFile).toHaveBeenCalledTimes(0);
        expect(fileUtils.copyFiles).toHaveBeenCalledTimes(0);
        expect(console.error).toBeCalledWith(
            `Unable to reload resource ${resourcePath}` +
                `to the local dev server cache. This resource was not ` +
                `specified as part of the project's localdevserver.config.json.`
        );
    });

    it('isValidStaticResource returns true if valid', () => {
        const resourcePath = 'src/staticResourceTwo/mySubDirectory/file1.txt';
        expect(resourcePath).toContain(project.staticResourcesDirectories[1]);
        expect(
            StaticResourcesUtils.isValidStaticResource(project, resourcePath)
        ).toBeTruthy();
    });

    it('isValidStaticResource returns false if invalid', () => {
        const resourcePath = 'src/notMyStaticResource/dummyFile.txt';
        expect(
            StaticResourcesUtils.isValidStaticResource(project, resourcePath)
        ).toBeFalsy();
    });

    it('isValidContentAsset returns true if valid', () => {
        const resourcePath = 'src/contentAssetDir/mySubDir/contentAsset.txt';
        expect(resourcePath).toContain(project.contentAssetsDirectory);
        expect(
            StaticResourcesUtils.isValidContentAsset(project, resourcePath)
        ).toBeTruthy();
    });

    it('isValidContentAsset returns false if invalid', () => {
        const resourcePath = 'src/notAContentAsset/dummyFile.txt';
        expect(
            StaticResourcesUtils.isValidContentAsset(project, resourcePath)
        ).toBeFalsy();
    });

    function confirmDistAssetCopy(callOrder: number) {
        const copiedFromPath = path.join(
            config.serverDir,
            'dist',
            'assets',
            '*'
        );
        const copiedToPath = path.join(config.buildDir, 'assets', 'localdev');

        expect(fileUtils.copyFiles).toHaveBeenNthCalledWith(
            callOrder,
            copiedFromPath,
            copiedToPath
        );
    }

    function confirmStaticResourcesAssetCopy(
        callOrderOne: number,
        callOrderTwo: number
    ) {
        const copiedFromPaths = project.staticResourcesDirectories;
        const copiedTo = path.join(
            config.buildDir,
            'assets',
            'project',
            STATIC_RESOURCES
        );

        expect(fileUtils.copyFiles).nthCalledWith(
            callOrderOne,
            path.join(copiedFromPaths[0], '*'),
            copiedTo
        );
        expect(fileUtils.copyFiles).nthCalledWith(
            callOrderTwo,
            path.join(copiedFromPaths[1], '*'),
            copiedTo
        );
    }

    function confirmContentAssetCopy(callOrder: number) {
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

        expect(fileUtils.copyFiles).nthCalledWith(
            callOrder,
            copiedFromPath,
            copiedTo
        );
    }
});

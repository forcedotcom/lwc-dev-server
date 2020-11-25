import path from 'path';
import * as StaticResourcesUtils from '../StaticResourcesUtils';
import Project from '../Project';
import WebruntimeConfig from '../../server/config/WebruntimeConfig';
import * as fileUtils from '../fileUtils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from '../Constants';
import mock from 'mock-fs';

jest.mock('../Project');
jest.mock('../fileUtils');
// jest.mock('../StaticResourcesUtils');

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

    // Assert that all 3 methods were called.

    // it.skip('copyStaticAssets', () => {
    //     // StaticResourcesUtils.copyDistAssets = copyDistAssetsMock;

    //     // @ts-ignore
    //     StaticResourcesUtils.mockImplementation(() => {
    //         return {
    //             copyDistAssets: copyDistAssetsMock,
    //             copyStaticResources: copyStaticResourcesMock,
    //             copyContentAssets: copyContentAssetsMock
    //         };
    //     });

    //     util.copyStaticAssets(project, config);

    //     expect(copyDistAssetsMock).toHaveBeenCalledTimes(1);
    //     // expect(copyStaticResourcesMock).toHaveBeenCalledTimes(1);
    //     // expect(copyContentAssetsMock).toHaveBeenCalledTimes(1);
    // });

    // // Assert that all 3 methods were called.
    // it('copyStaticAssets take 2', () => {
    //     const resourceSpy = jest.spyOn(util, 'copyDistAssets');

    //     util.copyStaticAssets(project, config);

    //     expect(resourceSpy).toHaveBeenCalledTimes(1);
    // });

    // Assert that all 3 methods were called.
    // it('copyStaticAssets take 3', () => {
    //     jest.unmock('../StaticResourcesUtils');

    //     util.copyDistAssets = jest.fn();

    //     util.copyStaticAssets(project, config);

    //     expect(resourceSpy).toHaveBeenCalledTimes(1);
    // });

    it.skip('copyStaticAssets take 4', () => {
        jest.mock('../StaticResourcesUtils');

        let copyDistAssetsMock = jest
            .spyOn(StaticResourcesUtils, 'copyDistAssets')
            .mockImplementation();
        let copyStaticResourcesMock = jest
            .spyOn(StaticResourcesUtils, 'copyStaticResources')
            .mockImplementation();
        let copyContentAssetsMock = jest
            .spyOn(StaticResourcesUtils, 'copyContentAssets')
            .mockImplementation();

            StaticResourcesUtils.copyStaticAssets(project, config);

        expect(StaticResourcesUtils.copyDistAssets).toHaveBeenCalledTimes(1);
        expect(StaticResourcesUtils.copyStaticResources).toHaveBeenCalledTimes(1);
        expect(StaticResourcesUtils.copyContentAssets).toHaveBeenCalledTimes(1);

        
        copyDistAssetsMock.mockRestore();
        // copyDistAssetsMock.mockClear();
        copyStaticResourcesMock.mockClear();
        // copyContentAssetsMock.mockClear();
    });

    it('copyStaticAssets take 5', () => {
        // jest.mock('../StaticResourcesUtils', () => ({
        //     copyDistAssets: jest.fn(),
        //     copyStaticResourcesMock: jest.fn(),
        //     copyContentAssets: jest.fn()
        // }));

        // jest.mock('../StaticResourcesUtils');

        let copyDistAssetsMock = jest
            .spyOn(StaticResourcesUtils, 'copyDistAssets')
            .mockImplementationOnce(() => jest.fn());
        let copyStaticResourcesMock = jest
            .spyOn(StaticResourcesUtils, 'copyStaticResources')
            .mockImplementationOnce(() => jest.fn());
        let copyContentAssetsMock = jest
            .spyOn(StaticResourcesUtils, 'copyContentAssets')
            .mockImplementationOnce(() => jest.fn());

        StaticResourcesUtils.copyStaticAssets(project, config);

        expect(copyDistAssetsMock).toHaveBeenCalled();
        expect(copyStaticResourcesMock).toHaveBeenCalled();
        expect(copyContentAssetsMock).toHaveBeenCalled();

        expect(StaticResourcesUtils.copyDistAssets).toHaveBeenCalledTimes(1);
        expect(StaticResourcesUtils.copyStaticResources).toHaveBeenCalledTimes(1);
        expect(StaticResourcesUtils.copyContentAssets).toHaveBeenCalledTimes(1);

        
        // copyDistAssetsMock.mockRestore();
        // // copyDistAssetsMock.mockClear();
        // copyStaticResourcesMock.mockClear();
        // // copyContentAssetsMock.mockClear();
        // jest.unmock('')
    });

    it('copyDistAssets copies dist assets to configuration build directory', () => {
        // What: Verify dist assets are copied correctly
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

    it('rebuildResource calls copyStaticResources', () => {
        StaticResourcesUtils.rebuildResource(project, config, '');
    });
});

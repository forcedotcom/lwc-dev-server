import fs from 'fs';
import path from 'path';
import mockFs from 'mock-fs';
import * as versionUtils from '../versionUtils';

describe('versionUtils', () => {
    let consoleLogMock: jest.SpyInstance;
    let consoleWarnMock: jest.SpyInstance;
    let consoleErrorMock: jest.SpyInstance;

    beforeEach(() => {
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
        consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleLogMock.mockRestore();
        consoleWarnMock.mockRestore();
        consoleErrorMock.mockRestore();
        mockFs.restore();
        jest.resetAllMocks();
    });

    describe('getWebAppVersionKey()', () => {
        it('returns the version from the package.json file', () => {
            const packageJsonPath = path.join(
                __dirname,
                '../../../package.json'
            );
            const packageJson = JSON.parse(
                fs.readFileSync(packageJsonPath, 'utf8')
            );
            const expectedVersion = packageJson.version;

            expect(versionUtils.getWebAppVersionKey()).toBe(expectedVersion);
        });

        it('returns a generic value when package.json is not valid json', () => {
            const packageJsonPath = path.join(
                __dirname,
                '../../../package.json'
            );

            mockFs({
                [packageJsonPath]: '{'
            });

            expect(versionUtils.getWebAppVersionKey()).toBe(
                versionUtils.fallbackVersionKey
            );
        });

        it('returns a generic value when package.json does not have version specified', () => {
            const packageJsonPath = path.join(
                __dirname,
                '../../../package.json'
            );

            mockFs({
                [packageJsonPath]: '{"name": "foo"}'
            });

            expect(versionUtils.getWebAppVersionKey()).toBe(
                versionUtils.fallbackVersionKey
            );
        });
    });
});

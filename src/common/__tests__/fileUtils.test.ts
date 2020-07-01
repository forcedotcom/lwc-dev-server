import fs from 'fs';
import mockFs from 'mock-fs';
import path from 'path';
import { ls } from 'shelljs';
import * as fileUtils from '../fileUtils';

describe('fileUtils', () => {
    const rootPath = '/Users/mikasa/dev/myproject';
    const defaultPath = 'default/path';
    const parentDir = 'parent';
    const fileName = 'file.txt';

    const childFolder = `${rootPath}/some/directory/assets`;
    const childFolder2 = `${rootPath}/some/other/assets`;
    const childFolder3 = `${rootPath}/some/more/assets`;

    afterEach(mockFs.restore);

    describe('copyFiles()', () => {
        it('copies a directory of files', () => {
            mockFs({
                'copy/from': {
                    'test.txt': 'test',
                    'test2.txt': 'test2',
                    'test3.js': 'test3',
                    '.test4': 'test4'
                },
                'copy/to': {}
            });

            fileUtils.copyFiles('copy/from', 'copy/to');

            const expected = [
                'from',
                'from/.test4',
                'from/test.txt',
                'from/test2.txt',
                'from/test3.js'
            ];
            const actual = ls('-RA', 'copy/to');

            expect(actual).toEqual(expect.arrayContaining(expected));
        });

        it('copies a directory recursively', () => {
            mockFs({
                'copy/from': {
                    'test.txt': 'test',
                    subdirectory: {
                        'test2.txt': 'test2'
                    }
                },
                'copy/to': {}
            });

            fileUtils.copyFiles('copy/from', 'copy/to');

            const expected = [
                'from',
                'from/subdirectory',
                'from/subdirectory/test2.txt',
                'from/test.txt'
            ];
            const actual = ls('-RA', 'copy/to');

            expect(actual).toEqual(expect.arrayContaining(expected));
        });

        it('copies a single file', () => {
            mockFs({
                'copy/from': {
                    'test.txt': 'test'
                },
                'copy/to': {}
            });

            fileUtils.copyFiles('copy/from/test.txt', 'copy/to');

            const expected = ['test.txt'];
            const actual = ls('-RA', 'copy/to');

            expect(actual).toEqual(expect.arrayContaining(expected));
        });

        it('copies to a dest that has non existent directories', () => {
            mockFs({
                'copy/from': {
                    'test.txt': 'test',
                    'test2.txt': 'test2'
                },
                'copy/to': {}
            });

            fileUtils.copyFiles('copy/from', 'copy/to/somewhere/inside');

            const expected = [
                'somewhere',
                'somewhere/inside',
                'somewhere/inside/from',
                'somewhere/inside/from/test.txt',
                'somewhere/inside/from/test2.txt'
            ];
            const actual = ls('-RA', 'copy/to');

            expect(actual).toEqual(expect.arrayContaining(expected));
        });

        it('can copy only the files within a directory', () => {
            mockFs({
                'copy/from': {
                    'test.txt': 'test',
                    'test2.txt': 'test2'
                },
                'copy/to': {}
            });

            fileUtils.copyFiles('copy/from/*', 'copy/to');

            const expected = ['test.txt', 'test2.txt'];
            const actual = ls('-RA', 'copy/to');

            expect(actual).toEqual(expect.arrayContaining(expected));
        });
    });

    describe('removeFile()', () => {
        it('removes a file', () => {
            mockFs({
                'test.txt': 'test'
            });

            expect(fs.existsSync('test.txt')).toBeTruthy();
            fileUtils.removeFile('test.txt');
            expect(fs.existsSync('test.txt')).toBeFalsy();
        });

        it('removes an empty directory', () => {
            const project = '/Users/mikasa/dev/myproject';
            const directoryToRemove = `${project}/.localdevserver`;
            mockFs({
                [`${project}/src/modules`]: {},
                [`${directoryToRemove}`]: {}
            });

            expect(fs.existsSync(directoryToRemove)).toBeTruthy();
            fileUtils.removeFile(directoryToRemove);
            expect(fs.existsSync(directoryToRemove)).toBeFalsy();
        });

        it('removes a non empty directory', () => {
            const project = '/Users/mikasa/dev/myproject';
            const directoryToRemove = `${project}/.localdevserver`;
            mockFs({
                [`${project}/src/modules`]: {},
                [`${directoryToRemove}`]: {
                    assets: {
                        'testing.txt': 'testing'
                    }
                }
            });

            expect(fs.existsSync(directoryToRemove)).toBeTruthy();
            fileUtils.removeFile(directoryToRemove);
            expect(fs.existsSync(directoryToRemove)).toBeFalsy();
        });

        it('doesnt throw an error if the directory doesnt exist', () => {
            const project = '/Users/mikasa/dev/myproject';
            mockFs({
                [`${project}/src/modules`]: {}
            });

            expect(() => {
                fileUtils.removeFile(
                    '/Users/mikasa/dev/myproject/.localdevserver'
                );
            }).not.toThrow();
        });
    });

    describe('findFileWithDefaultPath()', () => {
        it('returns the default file path if present', () => {
            const filePath = path.normalize(
                `${rootPath}/${defaultPath}/${parentDir}/${fileName}`
            );
            mockFs({
                [`${rootPath}`]: {},
                [`${filePath}`]: ''
            });

            expect(fs.existsSync(filePath)).toBeTruthy();
            const result = fileUtils.findFileWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir,
                fileName
            );
            expect(result).toBe(filePath);
        });

        it('returns a non-default file path if present', () => {
            const nonDefault = 'other/path';
            const nonDefaultFilePath = path.normalize(
                `${rootPath}/${nonDefault}/${parentDir}/${fileName}`
            );
            mockFs({
                [`${rootPath}`]: {},
                [`${nonDefaultFilePath}`]: ''
            });

            expect(fs.existsSync(nonDefaultFilePath)).toBeTruthy();
            const result = fileUtils.findFileWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir,
                fileName
            );
            expect(result).toBe(nonDefaultFilePath);
        });

        it('returns blank if root is not found', () => {
            const result = fileUtils.findFileWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir,
                fileName
            );
            expect(result).toBe('');
        });

        it('returns blank if file is not found', () => {
            mockFs({
                [`${rootPath}`]: {}
            });

            const result = fileUtils.findFileWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir,
                fileName
            );
            expect(result).toBe('');
        });
    });

    describe('findFolderWithDefaultPath()', () => {
        it('returns the default folder path if present', () => {
            const folderPath = path.normalize(
                `${rootPath}/${defaultPath}/${parentDir}`
            );
            mockFs({
                [`${rootPath}`]: {},
                [`${folderPath}`]: {}
            });

            expect(fs.existsSync(folderPath)).toBeTruthy();
            const result = fileUtils.findFolderWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir
            );
            expect(result).toBe(folderPath);
        });

        it('returns a non-default folder path if present', () => {
            const nonDefault = 'other/path';
            const nonDefaultFilePath = path.normalize(
                `${rootPath}/${nonDefault}/${parentDir}`
            );
            mockFs({
                [`${rootPath}`]: {},
                [`${nonDefaultFilePath}`]: {}
            });

            expect(fs.existsSync(nonDefaultFilePath)).toBeTruthy();
            const result = fileUtils.findFolderWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir
            );
            expect(result).toBe(nonDefaultFilePath);
        });

        it('returns blank if root is not found', () => {
            const result = fileUtils.findFolderWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir
            );
            expect(result).toBeUndefined();
        });

        it('returns blank if folder is not found', () => {
            mockFs({
                [`${rootPath}`]: {}
            });

            const result = fileUtils.findFolderWithDefaultPath(
                rootPath,
                defaultPath,
                parentDir
            );
            expect(result).toBeUndefined();
        });
    });

    describe('findAllFolderPaths()', () => {
        const targetFolder = 'target';
        const packagesToCheck = ['force-app', 'force-app-2'];

        it('returns all instances of target folder', () => {
            const path1 = `${rootPath}/force-app/sample/${targetFolder}`;
            const path2 = `${rootPath}/force-app-2/other/${targetFolder}`;
            mockFs({
                [`${path1}`]: {},
                [`${path2}`]: {}
            });

            const result = fileUtils.findAllFolderPaths(
                rootPath,
                packagesToCheck,
                targetFolder
            );
            expect(result.length).toEqual(2);
            expect(result).toContain(path.normalize(path1));
            expect(result).toContain(path.normalize(path2));
        });

        it('returns all instances of target folder while ignoring other folders', () => {
            const path1 = `${rootPath}/force-app/sample/${targetFolder}`;
            const path2 = `${rootPath}/force-app-2/other/${targetFolder}`;
            const path3 = `${rootPath}/force-app/ignore1/${targetFolder}`;
            const path4 = `${rootPath}/force-app-2/ignore2/${targetFolder}`;
            mockFs({
                [`${path1}`]: {},
                [`${path2}`]: {},
                [`${path3}`]: {},
                [`${path4}`]: {}
            });

            const result = fileUtils.findAllFolderPaths(
                rootPath,
                packagesToCheck,
                targetFolder,
                new Set(['ignore1', 'ignore2'])
            );
            expect(result.length).toEqual(2);
            expect(result).toContain(path.normalize(path1));
            expect(result).toContain(path.normalize(path2));
        });

        it('returns empty array when child folder is not found', () => {
            mockFs({
                [`${rootPath}`]: {}
            });

            const result = fileUtils.findAllFolderPaths(
                rootPath,
                packagesToCheck,
                targetFolder
            );
            expect(result).toStrictEqual([]);
        });

        it('returns empty array when root is not found', () => {
            const result = fileUtils.findAllFolderPaths(
                rootPath,
                packagesToCheck,
                parentDir
            );
            expect(result).toStrictEqual([]);
        });
    });

    describe('findFolders()', () => {
        it('returns child folder', () => {
            mockFs({
                [`${rootPath}`]: {},
                [`${childFolder}`]: {}
            });

            const result = fileUtils.findFolders(rootPath, 'assets', []);
            expect(result).toStrictEqual([path.normalize(childFolder)]);
        });

        it('returns multiple child folders', () => {
            mockFs({
                [`${rootPath}`]: {},
                [`${childFolder}`]: {},
                [`${childFolder2}`]: {},
                [`${childFolder3}`]: {}
            });

            const result = fileUtils.findFolders(rootPath, 'assets', []);
            expect(result.length).toEqual(3);
            expect(result).toContain(path.normalize(childFolder));
            expect(result).toContain(path.normalize(childFolder2));
            expect(result).toContain(path.normalize(childFolder3));
        });

        it('returns child folder while ignoring other folders', () => {
            const folders_to_ignore = new Set(['other', 'more']);
            mockFs({
                [`${rootPath}`]: {},
                [`${childFolder}`]: {},
                [`${childFolder2}`]: {},
                [`${childFolder3}`]: {}
            });

            const result = fileUtils.findFolders(
                rootPath,
                'assets',
                [],
                folders_to_ignore
            );
            expect(result).toStrictEqual([path.normalize(childFolder)]);
        });

        it('returns empty array when child folder is not found', () => {
            mockFs({
                [`${rootPath}`]: {}
            });

            const result = fileUtils.findFolders(rootPath, parentDir, []);
            expect(result).toStrictEqual([]);
        });

        it('returns empty array when root is not found', () => {
            const result = fileUtils.findFolders(rootPath, parentDir, []);
            expect(result).toStrictEqual([]);
        });
    });

    describe('getFileContents()', () => {
        const exampleFile = '/Users/mikasa/dev/exampleFile.txt';

        it('returns file contents if file is present', () => {
            mockFs({
                [`${exampleFile}`]: 'sampleContent'
            });

            expect(fs.existsSync(exampleFile)).toBeTruthy();
            const result = fileUtils.getFileContents(exampleFile);
            expect(result).toBe('sampleContent');
        });

        it('returns undefined if file is not present', () => {
            expect(fs.existsSync(exampleFile)).toBeFalsy();
            const result = fileUtils.getFileContents(exampleFile);
            expect(result).toBeUndefined();
        });
    });
});

import fs from 'fs';
import mockFs from 'mock-fs';
import { ls } from 'shelljs';
import * as fileUtils from '../fileUtils';

describe('fileUtils', () => {
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
});

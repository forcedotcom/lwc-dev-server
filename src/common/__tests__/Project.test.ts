import Project from '../Project';
import mock from 'mock-fs';

describe('project', () => {
    // Stop mocking 'fs' after each test
    afterEach(mock.restore);

    describe('getDirectory()', () => {
        test('when a project is resolved to the relative current directory "." then we utilize the current working directory', () => {
            const project = new Project('.');
            expect(project.getDirectory()).toEqual(process.cwd());
        });

        test('when a project is specified as an existing relative directory, then we return that directory', () => {
            mock({
                'my-project': {
                    'package.json': '{}'
                }
            });

            const project = new Project('my-project/');

            expect(project.getDirectory()).toEqual('my-project/');
        });

        test('when a project is specified as an existing relative directory without a backslash, then we return that directory without a backslash', () => {
            mock({
                'my-project': {
                    'package.json': '{}'
                }
            });

            const project = new Project('my-project');

            expect(project.getDirectory()).toEqual('my-project');
        });
    });

    describe('getModuleSourceDirectory()', () => {
        test('handles a relative moduleSourceDirectory specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json':
                        '{"moduleSourceDirectory": "modulesSrc/"}'
                }
            });

            const project = new Project('my-project/');

            expect(project.getModuleSourceDirectory()).toBe(
                'my-project/modulesSrc/'
            );
        });

        test('handles an absolute moduleSourceDirectory specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json':
                        '{"moduleSourceDirectory": "/foo/modulesSrc/"}'
                }
            });

            const project = new Project('my-project/');

            expect(project.getModuleSourceDirectory()).toBe('/foo/modulesSrc/');
        });

        test('uses a fallback when moduleSourceDirectory is not specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': '{}'
                }
            });

            const project = new Project('my-project/');

            expect(project.getModuleSourceDirectory()).toBe('my-project/src');
        });

        test.todo(
            'when project is an sfdx project, then we can infer the modules directory from the packagedModules property'
        );

        test('returns null when the project is invalid', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': '{}'
                }
            });
            const project = new Project('.');
            expect(project.getModuleSourceDirectory()).toBe(null);
        });
    });
});

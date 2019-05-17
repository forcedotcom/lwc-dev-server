import Project from '../Project';
import mock from 'mock-fs';
import SfdxConfiguration from '../../user/SfdxConfiguration';

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

        test('throws an exception when referencing an invalid project', () => {
            mock({
                'invalid-project': {
                    // Empty
                },
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': '{}'
                }
            });
            try {
                new Project('invalid-project/');
            } catch (e) {
                expect(e.message).toBe(
                    "Directory specified 'invalid-project/' does not resolve to a project. The specified directory must have package.json in it."
                );
            }
            // expect().toThrowError();
        });
    });

    describe('when creating from sfdxconfiguration', () => {
        test('then resolve to the sfdx-project directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project/');
            const sfdxConfiguration = new SfdxConfiguration(project);
            expect(project.getDirectory()).toBe('my-project/');
        });

        test('then configuration passed in is stored', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project/');
            const sfdxConfiguration = new SfdxConfiguration(project);
            project.setSfdxConfiguration(sfdxConfiguration);

            expect(project.getSfdxConfiguration()).toBe(sfdxConfiguration);
        });

        test('then use the packageDirectories to resolve the module directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'force-app',
                                default: true
                            }
                        ]
                    }),
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project/');
            const sfdxConfiguration = new SfdxConfiguration(project);
            project.setSfdxConfiguration(sfdxConfiguration);

            expect(project.getModuleSourceDirectory()).toBe(
                'my-project/force-app'
            );
        });

        test('then use the packageDirectories to resolve the static resources directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'force-app',
                                default: true
                            }
                        ]
                    }),
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project/');
            const sfdxConfiguration = new SfdxConfiguration(project);
            project.setSfdxConfiguration(sfdxConfiguration);

            expect(project.getStaticResourcesDirectory()).toBe(
                'my-project/force-app/main/default/staticresources'
            );
        });

        test('then configure the port from the configuration', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project/');
            const sfdxConfiguration = new SfdxConfiguration(project);
            sfdxConfiguration.port = 123456;
            project.setSfdxConfiguration(sfdxConfiguration);

            expect(project.getConfiguration().port).toBe(
                sfdxConfiguration.port
            );
        });

        test('then configure the namespace from the configuration', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project/');
            const sfdxConfiguration = new SfdxConfiguration(project);
            sfdxConfiguration.namespace = 'my-project-namespace';
            project.setSfdxConfiguration(sfdxConfiguration);

            expect(project.getConfiguration().namespace).toBe(
                sfdxConfiguration.namespace
            );
        });
    });
});

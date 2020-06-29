import Project from '../Project';
import mock from 'mock-fs';
import path from 'path';
import * as fileUtils from '../fileUtils';

describe('project', () => {
    // Stop mocking 'fs' after each test
    afterEach(mock.restore);

    describe('when retrieving the project directory', () => {
        test('project is resolved to the relative current directory ".", so return the current directory', () => {
            const project = new Project('.');
            expect(project.directory).toEqual(process.cwd());
        });

        test('project is specified as an existing relative directory, so return that directory', () => {
            mock({
                'my-project': {
                    'package.json': '{}'
                }
            });

            const project = new Project('my-project');

            expect(project.directory).toEqual('my-project');
        });

        test('project is specified as an existing relative directory ending with a slash, so return that directory with a slash', () => {
            mock({
                'my-project': {
                    'package.json': '{}'
                }
            });

            const expected = path.normalize('my-project/');
            const project = new Project(expected);

            expect(project.directory).toEqual(expected);
        });

        test('throws an exception when referencing a project that does not exist.', () => {
            mock({
                'invalid-project': {}
            });
            try {
                new Project('invalid-project-DOES-NOT-EXIST');
            } catch (e) {
                expect(e.message).toBe(
                    "Directory specified 'invalid-project-DOES-NOT-EXIST' does not resolve to a project. The specified directory must have package.json or sfdx-project.json in it."
                );
            }
        });
    });

    describe('when retrieving the package.json and sfdx-package.json files', () => {
        test('package.json file is found in the current directory.', () => {
            mock({
                'package.json': '{}'
            });

            const project = new Project('.');

            expect(project.isSfdx).toEqual(false);
        });

        test('sfdx-package.json file is found in the current directory.', () => {
            mock({
                'sfdx-project.json': '{}'
            });

            const project = new Project('.');

            expect(project.isSfdx).toEqual(true);
        });

        test('projects with sfdx-project.json are valid without a package.json', () => {
            mock({
                'valid-project': {
                    'sfdx-project.json': '{}'
                }
            });

            expect(new Project('valid-project').isSfdx).toBe(true);
        });

        test('throws an exception when referencing a project without package.json or sfdx-project.json', () => {
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
                new Project('invalid-project');
            } catch (e) {
                expect(e.message).toBe(
                    "Directory specified 'invalid-project' does not resolve to a project. The specified directory must have package.json or sfdx-project.json in it."
                );
            }
        });
    });

    describe('when retrieving the module source directory', () => {
        test('handles a relative modulesSourceDirectory specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json':
                        '{"modulesSourceDirectory": "modulesSrc"}'
                },
                'my-project/modulesSrc': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', 'modulesSrc');
            expect(project.modulesSourceDirectory).toBe(expected);
        });

        test('handles an absolute modulesSourceDirectory specified in the json config', () => {
            const modulesSourceDirectory = path.normalize('/foo/modulesSrc/');
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory
                    })
                },
                '/foo/modulesSrc': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');

            expect(project.modulesSourceDirectory).toBe(modulesSourceDirectory);
        });

        test('uses a fallback when modulesSourceDirectory is not specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': '{}'
                },
                'my-project/src': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', 'src');

            expect(project.modulesSourceDirectory).toBe(expected);
        });

        test('logs a warning when the modules source directory does not exist', () => {
            jest.spyOn(console, 'warn').mockImplementation();
            const modulesSourceDirectory = path.normalize('invalidDir');
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory
                    })
                }
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', 'invalidDir');

            project.modulesSourceDirectory;
            expect(console.warn).toBeCalledWith(
                `modules source directory '${expected}' does not exist`
            );
        });
    });

    describe('when retrieving the port', () => {
        test('handles the port specified in the json config', () => {
            const port = 12345;
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        port
                    })
                }
            });

            const project = new Project('my-project');

            expect(project.port).toBe(port);
        });

        test('uses a fallback when a port is not specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': '{}'
                }
            });

            const project = new Project('my-project');

            expect(project.port).toBe(3333);
        });

        test('then configure the port from the configuration', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });

            const project = new Project('my-project');
            project.configuration.port = 123456;

            expect(project.configuration.port).toBe(123456);
        });
    });

    describe('when retrieving the custom labels path', () => {
        test('handles a relative customLabelsPath specified in the json config', () => {
            const labelsPath = path.join(
                'labels',
                'CustomLabels.labels-meta.xml'
            );

            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: 'modulesSrc',
                        customLabelsFile: labelsPath
                    })
                }
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', labelsPath);
            expect(project.customLabelsPath).toBe(expected);
        });

        test('handles an absolute customLabelsPath specified in the json config', () => {
            const labelsFile = path.normalize(
                '/foo/labels/CustomLabels.labels-meta.xml'
            );
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: 'modulesSrc',
                        customLabelsFile: labelsFile
                    })
                }
            });

            const project = new Project('my-project');
            expect(project.customLabelsPath).toBe(labelsFile);
        });
    });

    describe('when retrieving the content assets directory', () => {
        test('handles a relative contentAssetsDirectory specified in the json config', () => {
            const contentAssetsDir = 'contentassets';

            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: 'modulesSrc',
                        contentAssetsDirectory: contentAssetsDir
                    })
                },
                'my-project/contentassets': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', contentAssetsDir);
            expect(project.contentAssetsDirectory).toBe(expected);
        });

        test('handles an absolute contentAssetsDirectory specified in the json config', () => {
            const contentAssetsDirectory = path.normalize('/foo/contentassets');
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: 'modulesSrc',
                        contentAssetsDirectory: contentAssetsDirectory
                    })
                },
                '/foo/contentassets': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');
            expect(project.contentAssetsDirectory).toBe(contentAssetsDirectory);
        });
    });

    describe('configuration overrides', () => {
        test('when modulesSourceDirectory is specified in the config json file, it takes precedence over sfdx-project.json', () => {
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
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: path.normalize(
                            'specified/directory/'
                        )
                    })
                },
                'my-project/specified/directory': mock.directory({
                    items: {}
                })
            });

            jest.spyOn(fileUtils, 'findFolders').mockReturnValue([]);
            const project = new Project(path.join('my-project', path.sep));
            const expected = path.join(
                'my-project',
                'specified',
                'directory',
                path.sep
            );

            expect(project.modulesSourceDirectory).toBe(expected);
        });

        test('when staticResourcesDirectories is specified in the config json file, it takes precedence over sfdx-project.json', () => {
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
                    'localdevserver.config.json': JSON.stringify({
                        staticResourcesDirectories: [
                            path.normalize('specified/directory/assets/')
                        ]
                    })
                }
            });

            const project = new Project('my-project');
            const expected = [
                path.join('my-project', 'specified', 'directory', 'assets', '/')
            ];

            expect(project.staticResourcesDirectories).toStrictEqual(expected);
        });

        test('when staticResourcesDirectories is specified as empty in the config json file, staticResourcesDirectories property returns null', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        staticResourcesDirectories: []
                    })
                }
            });
            jest.spyOn(fileUtils, 'findFolders').mockReturnValue([]);
            const project = new Project('my-project');

            expect(project.staticResourcesDirectories).toStrictEqual([]);
        });

        test('when staticResourcesDirectories is specified as absolute in the config json file, staticResourcesDirectories uses the specified file unchanged', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        staticResourcesDirectories: ['/tmp/absolute/path']
                    })
                }
            });

            const project = new Project('my-project');

            expect(project.staticResourcesDirectories).toStrictEqual([
                '/tmp/absolute/path'
            ]);
        });

        test('when staticResourcesDirectories is not specified as a list, log a warning and return an empty list', () => {
            jest.spyOn(console, 'warn').mockImplementation();

            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        staticResourcesDirectories: '/tmp/absolute/path'
                    })
                }
            });

            const project = new Project('my-project');

            expect(project.staticResourcesDirectories).toStrictEqual([]);
            expect(console.warn).toBeCalledWith(
                expect.stringContaining(
                    'staticResourcesDirectories must be provided in a list format'
                )
            );
        });
    });
});

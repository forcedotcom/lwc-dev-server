import Project from '../Project';
import mock from 'mock-fs';
import path from 'path';
import fs from 'fs';
import * as fileUtils from '../fileUtils';

describe('project', () => {
    // Stop mocking 'fs' after each test
    afterEach(mock.restore);

    describe('getDirectory()', () => {
        test('when a project is resolved to the relative current directory "." then we utilize the current working directory', () => {
            const project = new Project('.');
            expect(project.directory).toEqual(process.cwd());
        });

        test('when a project is specified as an existing relative directory, then we return that directory', () => {
            mock({
                'my-project': {
                    'package.json': '{}'
                }
            });

            const project = new Project('my-project');

            expect(project.directory).toEqual('my-project');
        });

        test('when a project is specified as an existing relative directory ending with a slash, then we return that directory with a slash', () => {
            mock({
                'my-project': {
                    'package.json': '{}'
                }
            });

            const expected = path.normalize('my-project/');
            const project = new Project(expected);

            expect(project.directory).toEqual(expected);
        });

        test('when searching the current directory, the package.json file is found.', () => {
            mock({
                'package.json': '{}'
            });

            const project = new Project('.');

            expect(project.isSfdx).toEqual(false);
        });

        test('when searching the current directory, the sfdx-package.json file is found.', () => {
            mock({
                'sfdx-project.json': '{}'
            });

            const project = new Project('.');

            expect(project.isSfdx).toEqual(true);
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

        test('logs warning when the modules source directory does not exist', () => {
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

        test('handles port specified in the json config', () => {
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

        test('uses a fallback when port is not specified in the json config', () => {
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': '{}'
                }
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', 'src');

            expect(project.port).toBe(3333);
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

        test('throws an exception when referencing a folder that does not exist.', () => {
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

        test('projects with sfdx-project.json are valid without a package.json', () => {
            mock({
                'valid-project': {
                    'sfdx-project.json': '{}'
                }
            });

            expect(new Project('valid-project').isSfdx).toBe(true);
        });
    });

    describe('when retrieving the custom labels path', () => {
        test('handles a relative customLabelsPath specified in the json config', () => {
            const customLabelsFile = path.join(
                'labels',
                'CustomLabels.labels-meta.xml'
            );

            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: 'modulesSrc',
                        customLabelsFile
                    })
                }
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', customLabelsFile);
            expect(project.customLabelsPath).toBe(expected);
        });

        test('handles an absolute customLabelsPath specified in the json config', () => {
            const customLabelsFile = path.normalize(
                '/foo/labels/CustomLabels.labels-meta.xml'
            );
            mock({
                'my-project': {
                    'package.json': '{}',
                    'localdevserver.config.json': JSON.stringify({
                        modulesSourceDirectory: 'modulesSrc',
                        customLabelsFile
                    })
                }
            });

            const project = new Project('my-project');
            expect(project.customLabelsPath).toBe(customLabelsFile);
        });
    });

    describe('when creating with sfdx-project.json', () => {
        // @ts-ignore
        let mockFindFolders;

        beforeEach(() => {
            mockFindFolders = jest
                .spyOn(fileUtils, 'findFolders')
                .mockReturnValue([
                    path.join('force-app', 'main', 'default', 'staticresources')
                ]);
        });

        afterEach(() => {
            // @ts-ignore
            mockFindFolders.mockRestore();
        });

        test('then resolve to the sfdx-project directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });
            const project = new Project('my-project');

            expect(project.directory).toBe('my-project');
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
                },
                'my-project/force-app': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', 'force-app');
            expect(project.modulesSourceDirectory).toBe(expected);
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
            const project = new Project('my-project');
            const expected = [
                path.join(
                    'my-project',
                    'force-app',
                    'main',
                    'default',
                    'staticresources'
                )
            ];
            expect(project.staticResourcesDirectories).toStrictEqual(expected);
        });

        test('configures the custom labels file if it exists', () => {
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
                },
                'my-project/force-app/main/default/labels/CustomLabels.labels-meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
                    <CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata"></CustomLabels>`
            });

            const project = new Project('my-project');
            const expected = path.join(
                'my-project',
                'force-app',
                'main',
                'default',
                'labels',
                'CustomLabels.labels-meta.xml'
            );
            expect(project.customLabelsPath).toBe(expected);
        });

        test('does not configure the custom labels file if its not present', () => {
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

            const project = new Project('my-project');
            expect(project.customLabelsPath).toBeUndefined();
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

        test('then configure the namespace from the configuration', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}',
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                }
            });

            const project = new Project('my-project');
            project.configuration.namespace = 'my-project-namespace';

            expect(project.configuration.namespace).toBe(
                'my-project-namespace'
            );
        });

        test('then detect the static resource directory from sfdx-project.json', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'force-app',
                                default: true
                            }
                        ]
                    })
                }
            });

            const project = new Project('my-project');
            const expected = [
                path.join(
                    'my-project',
                    'force-app',
                    'main',
                    'default',
                    'staticresources'
                )
            ];

            expect(project.staticResourcesDirectories).toStrictEqual(expected);
        });

        test('then detect the modules source directory from sfdx-project.json', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'force-app',
                                default: true
                            }
                        ]
                    })
                },
                'my-project/force-app': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project');
            const expected = path.join('my-project', 'force-app');

            expect(project.modulesSourceDirectory).toBe(expected);
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
            const project = new Project('my-project/');
            const expected = path.join(
                'my-project',
                'specified',
                'directory',
                '/'
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

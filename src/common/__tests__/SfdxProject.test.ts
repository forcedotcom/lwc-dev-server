import Project from '../Project';
import SfdxProject from '../SfdxProject';
import mock from 'mock-fs';
import path from 'path';
import * as fileUtils from '../fileUtils';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';

describe('sfdxProject', () => {
    const configurationPath = path.join(
        'my-project',
        'localdevserver.config.json'
    );
    let configuration: any;

    beforeEach(() => {
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
        configuration = new LocalDevServerConfiguration(configurationPath);
    });

    // Stop mocking 'fs' after each test
    afterEach(mock.restore);

    describe('when retrieving isSfdx', () => {
        test('isSfdx is true when sfdx-project.json is present', () => {
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            expect(sfdxProject.isSfdxProject).toBe(true);
        });

        test('isSfdx is false when sfdx-project.json is not present', () => {
            mock({
                'my-project': {}
            });
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            expect(sfdxProject.isSfdxProject).toBe(false);
        });
    });

    describe('when retrieving package directories', () => {
        test('returns packageDirectories if present', () => {
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            const expected = ['force-app'];
            expect(sfdxProject.getPackageDirectories()).toStrictEqual(expected);
        });

        test('does not return values if sfdx-project is missing', () => {
            mock({
                'my-project': {}
            });
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            expect(sfdxProject.getPackageDirectories()).toStrictEqual([]);
        });

        test('does not return values if packageDirectories is not present in sfdx-project.json', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': '{}'
                }
            });
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            expect(sfdxProject.getPackageDirectories()).toStrictEqual([]);
        });
    });

    describe('when retrieving the modules source directory', () => {
        test('use the localdevserver modules source path if specified', () => {
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
                    'localdevserver.config.json':
                        '{"modulesSourceDirectory": "modulesSrc"}',
                    'package.json': '{}'
                }
            });
            configuration = new LocalDevServerConfiguration(configurationPath);
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = 'modulesSrc';
            expect(sfdxProject.configuration.modulesSourceDirectory).toBe(
                expected
            );
        });

        test('use the packageDirectories to resolve the module directory', () => {
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
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = path.join('my-project', 'force-app');
            expect(sfdxProject.configuration.modulesSourceDirectory).toBe(
                expected
            );
        });
    });

    describe('when retrieving the static resources directories', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('use the localdevserver staticresources path if specified', () => {
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
            configuration = new LocalDevServerConfiguration(configurationPath);
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = [path.normalize('specified/directory/assets/')];
            expect(
                sfdxProject.configuration.staticResourcesDirectories
            ).toStrictEqual(expected);
        });

        test('use the packageDirectories to resolve the static resources directory', () => {
            jest.spyOn(fileUtils, 'findAllFolderPaths').mockReturnValue([
                path.join('force-app', 'main', 'default', 'staticresources')
            ]);
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = [
                path.normalize('force-app/main/default/staticresources')
            ];
            expect(
                sfdxProject.configuration.staticResourcesDirectories
            ).toStrictEqual(expected);
        });

        test('use the packageDirectores to resolve multiple static resources', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'force-app',
                                default: true
                            },
                            {
                                path: 'force-app-2',
                                default: false
                            }
                        ]
                    })
                },
                'my-project/force-app': mock.directory({
                    items: {}
                }),
                'my-project/force-app/main/default/staticresources': mock.directory(
                    {
                        items: {}
                    }
                ),
                'my-project/force-app-2': mock.directory({
                    items: {}
                }),
                'my-project/force-app-2/some/other/staticresources': mock.directory(
                    {
                        items: {}
                    }
                )
            });
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = [
                path.normalize(
                    'my-project/force-app-2/some/other/staticresources'
                ),
                path.normalize(
                    'my-project/force-app/main/default/staticresources'
                )
            ];
            expect(
                sfdxProject.configuration.staticResourcesDirectories
            ).toStrictEqual(expected);
        });
    });

    describe('when retrieving the custom labels file', () => {
        const labels_content = `<?xml version="1.0" encoding="UTF-8"?>
            <CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata"></CustomLabels>`;

        test('use the localdevserver customlabels path if specified', () => {
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
                        customLabelsFile: [
                            path.normalize(
                                'labels/CustomLabels.labels-meta.xml'
                            )
                        ]
                    })
                }
            });
            configuration = new LocalDevServerConfiguration(configurationPath);
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = [
                path.normalize('labels/CustomLabels.labels-meta.xml')
            ];

            expect(sfdxProject.configuration.customLabelsFile).toStrictEqual(
                expected
            );
        });

        test('use the packageDirectories to resolve the custom labels file', () => {
            mock({
                '/my-project': {
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
                '/my-project/force-app/main/default/labels/CustomLabels.labels-meta.xml': labels_content
            });

            const project = new Project(path.join(path.sep, 'my-project'));
            const expected = path.normalize(
                '/my-project/force-app/main/default/labels/CustomLabels.labels-meta.xml'
            );
            expect(project.customLabelsPath).toBe(expected);
        });

        test('configures the custom labels file if it exists outside of the default location', () => {
            jest.spyOn(fileUtils, 'findFolders').mockReturnValue([
                path.join('foo', 'labels')
            ]);
            mock({
                '/my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'foo',
                                default: true
                            }
                        ]
                    }),
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                },
                '/my-project/foo/labels/CustomLabels.labels-meta.xml': labels_content
            });

            const project = new Project(path.join(path.sep, 'my-project'));
            const expected = path.normalize(
                '/my-project/foo/labels/CustomLabels.labels-meta.xml'
            );
            expect(project.customLabelsPath).toBe(expected);
        });

        test('does not configure the custom labels file if it is not present', () => {
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            expect(sfdxProject.configuration.customLabelsFile).toBe('');
        });
    });

    describe('when retrieving the content assets directory', () => {
        test('use the localdevserver contentassets path if specified', () => {
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
                        contentAssetsDirectory: [
                            path.normalize('specified/directory/contentassets')
                        ]
                    })
                }
            });
            configuration = new LocalDevServerConfiguration(configurationPath);
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = [
                path.normalize('specified/directory/contentassets')
            ];

            expect(
                sfdxProject.configuration.contentAssetsDirectory
            ).toStrictEqual(expected);
        });

        test('use the packageDirectories to resolve the content assets directory', () => {
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
                }),
                'my-project/force-app/main/default/contentassets': mock.directory(
                    {
                        items: {}
                    }
                )
            });

            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = path.normalize(
                'my-project/force-app/main/default/contentassets'
            );
            expect(
                sfdxProject.configuration.contentAssetsDirectory
            ).toStrictEqual(expected);
        });

        test('configure content assets if the directory exists outside of the default location', () => {
            jest.spyOn(fileUtils, 'findFolders').mockReturnValue([
                path.join('foo', 'contentassets')
            ]);
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify({
                        packageDirectories: [
                            {
                                path: 'foo',
                                default: true
                            }
                        ]
                    }),
                    'localdevserver.config.json': '{}',
                    'package.json': '{}'
                },
                'my-project/foo': mock.directory({
                    items: {}
                }),
                'my-project/foo/contentassets': mock.directory({
                    items: {}
                })
            });

            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            const expected = path.normalize('my-project/foo/contentassets');
            expect(
                sfdxProject.configuration.contentAssetsDirectory
            ).toStrictEqual(expected);
        });

        test('do not configure content assets if the directory is not present', () => {
            const sfdxProject = new SfdxProject(configuration, 'my-project');
            sfdxProject.initWithSfdxConfiguration();

            expect(sfdxProject.configuration.contentAssetsDirectory).toBe('');
        });
    });
});

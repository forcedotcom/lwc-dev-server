import path from 'path';
import mock from 'mock-fs';
import ComponentIndex from '../ComponentIndex';
import Project from '../Project';

describe('ComponentIndex getModules()', () => {
    afterEach(mock.restore);

    // usages of these functions during mocking the filesystem cause exceptions
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    test('when not sfdx, returns modules modulesSourceDirectory', () => {
        mock({
            'my-project': {
                'package.json': '{}',
                'localdevserver.config.json': JSON.stringify({
                    modulesSourceDirectory: 'src/namespace'
                }),
                src: {
                    namespace: {
                        module: {
                            'module.html': '',
                            'module.js': 'extends LightningElement'
                        },
                        module2: {
                            'module2.html': '',
                            'module2.js':
                                'extends NavigationMixin(LightningElement)'
                        },
                        module3: {
                            'module3.html': '',
                            'module3 .js': ''
                        }
                    }
                }
            }
        });

        const expected: object[] = [
            {
                htmlName: 'namespace-module',
                jsName: 'namespace/module',
                namespace: 'namespace',
                name: 'module',
                url: '/lwc/preview/namespace/module',
                path: path.normalize(
                    'my-project/src/namespace/module/module.js'
                )
            },
            {
                htmlName: 'namespace-module2',
                jsName: 'namespace/module2',
                namespace: 'namespace',
                name: 'module2',
                url: '/lwc/preview/namespace/module2',
                path: path.normalize(
                    'my-project/src/namespace/module2/module2.js'
                )
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, returns modules in lwc directory', () => {
        mock({
            'my-project': {
                'package.json': JSON.stringify({
                    name: 'test-project'
                }),
                'sfdx-project.json': JSON.stringify({
                    packageDirectories: [
                        {
                            path: 'force-app',
                            default: true,
                            package: 'Test Package Name',
                            versionName: "Spring '19",
                            versionNumber: '1.0.0.NEXT'
                        }
                    ]
                }),
                'force-app': {
                    main: {
                        default: {
                            lwc: {
                                module: {
                                    'module.html': '',
                                    'module.js': ''
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js': ''
                                }
                            }
                        }
                    }
                }
            }
        });

        const expected: object[] = [
            {
                htmlName: 'c-module',
                jsName: 'c/module',
                namespace: 'c',
                name: 'module',
                url: '/lwc/preview/c/module',
                path: path.normalize(
                    'my-project/force-app/main/default/lwc/module/module.js'
                )
            },
            {
                htmlName: 'c-module2',
                jsName: 'c/module2',
                namespace: 'c',
                name: 'module2',
                url: '/lwc/preview/c/module2',
                path: path.normalize(
                    'my-project/force-app/main/default/lwc/module2/module2.js'
                )
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, returns project metadata', () => {
        mock({
            'my-project': {
                'package.json': JSON.stringify({
                    name: 'test-project'
                }),
                'sfdx-project.json': JSON.stringify({
                    packageDirectories: [
                        {
                            path: 'force-app',
                            default: true,
                            package: 'Test Package Name',
                            versionName: "Spring '19",
                            versionNumber: '1.0.0.NEXT'
                        }
                    ]
                }),
                'force-app': {
                    main: {
                        default: {
                            lwc: {
                                module: {
                                    'module.html': '',
                                    'module.js': ''
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js': ''
                                }
                            }
                        }
                    }
                }
            }
        });

        const expected: any = {
            projectName: 'test-project',
            packages: [
                {
                    packageName: 'Test Package Name',
                    key: 'package_1',
                    isDefault: true,
                    components: [
                        {
                            htmlName: 'c-module',
                            jsName: 'c/module',
                            namespace: 'c',
                            name: 'module',
                            url: '/lwc/preview/c/module',
                            path: path.normalize(
                                'my-project/force-app/main/default/lwc/module/module.js'
                            )
                        },
                        {
                            htmlName: 'c-module2',
                            jsName: 'c/module2',
                            namespace: 'c',
                            name: 'module2',
                            url: '/lwc/preview/c/module2',
                            path: path.normalize(
                                'my-project/force-app/main/default/lwc/module2/module2.js'
                            )
                        }
                    ]
                }
            ]
        };

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getProjectMetadata()).toEqual(expected);
    });

    test('when using sfdx, returns project metadata for default only', () => {
        mock({
            'my-project': {
                'package.json': JSON.stringify({
                    name: 'test-project'
                }),
                'sfdx-project.json': JSON.stringify({
                    packageDirectories: [
                        {
                            path: 'force-app',
                            default: true,
                            package: 'Test Package Name',
                            versionName: "Spring '19",
                            versionNumber: '1.0.0.NEXT'
                        },
                        {
                            path: 'force-app2',
                            package: 'Test Package Name2',
                            versionName: "Spring '19",
                            versionNumber: '1.0.0.NEXT'
                        }
                    ]
                }),
                'force-app': {
                    main: {
                        default: {
                            lwc: {
                                module: {
                                    'module.html': '',
                                    'module.js': ''
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js': ''
                                }
                            }
                        }
                    }
                },
                'force-app2': {
                    main: {
                        default: {
                            lwc: {
                                module3: {
                                    'module.html': '',
                                    'module.js': ''
                                },
                                module4: {
                                    'module2.html': '',
                                    'module2.js': ''
                                }
                            }
                        }
                    }
                }
            }
        });

        const expected: any = {
            projectName: 'test-project',
            packages: [
                {
                    packageName: 'Test Package Name',
                    key: 'package_1',
                    isDefault: true,
                    components: [
                        {
                            htmlName: 'c-module',
                            jsName: 'c/module',
                            namespace: 'c',
                            name: 'module',
                            url: '/lwc/preview/c/module',
                            path: path.normalize(
                                'my-project/force-app/main/default/lwc/module/module.js'
                            )
                        },
                        {
                            htmlName: 'c-module2',
                            jsName: 'c/module2',
                            namespace: 'c',
                            name: 'module2',
                            url: '/lwc/preview/c/module2',
                            path: path.normalize(
                                'my-project/force-app/main/default/lwc/module2/module2.js'
                            )
                        }
                    ]
                }
            ]
        };

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getProjectMetadata()).toEqual(expected);
    });

    test('when using sfdx, uses path for package name when label is not specified', () => {
        mock({
            'my-project': {
                'package.json': JSON.stringify({
                    name: 'test-project'
                }),
                'sfdx-project.json': JSON.stringify({
                    packageDirectories: [
                        {
                            path: 'force-app',
                            default: true
                        }
                    ]
                }),
                'force-app': {
                    main: {
                        default: {
                            lwc: {
                                module: {
                                    'module.html': '',
                                    'module.js': ''
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js': ''
                                }
                            }
                        }
                    }
                }
            }
        });

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);
        const metadata = componentIndex.getProjectMetadata();
        expect(metadata.packages[0].packageName).toBe('force-app');
    });
});

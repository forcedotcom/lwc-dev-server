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
                    modulesSourceDirectory: 'src/modules'
                }),
                src: {
                    modules: {
                        namespace: {
                            module: {
                                'module.html': '',
                                'module.js':
                                    'export default class Module extends LightningElement {}'
                            },
                            module2: {
                                'module2.html': '',
                                'module2.js':
                                    'export default class Module extends NavigationMixin(LightningElement) {}'
                            },
                            module3: {
                                'module3.html': '',
                                'module3 .js': ''
                            }
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
                url: '/preview/namespace/module',
                path: path.normalize(
                    'my-project/src/modules/namespace/module/module.js'
                )
            },
            {
                htmlName: 'namespace-module2',
                jsName: 'namespace/module2',
                namespace: 'namespace',
                name: 'module2',
                url: '/preview/namespace/module2',
                path: path.normalize(
                    'my-project/src/modules/namespace/module2/module2.js'
                )
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, returns modules in default lwc directory', () => {
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
                                    'module.js':
                                        'export default class Module extends LightningElement {}'
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js':
                                        'export default class Module extends NavigationMixin(LightningElement) {}'
                                },
                                module3: {
                                    'module3.html': '',
                                    'module3 .js': ''
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
                url: '/preview/c/module',
                path: path.normalize(
                    'my-project/force-app/main/default/lwc/module/module.js'
                )
            },
            {
                htmlName: 'c-module2',
                jsName: 'c/module2',
                namespace: 'c',
                name: 'module2',
                url: '/preview/c/module2',
                path: path.normalize(
                    'my-project/force-app/main/default/lwc/module2/module2.js'
                )
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, returns modules in custom lwc directory', () => {
        mock({
            'my-project': {
                'package.json': JSON.stringify({
                    name: 'test-project'
                }),
                'sfdx-project.json': JSON.stringify({
                    packageDirectories: [
                        {
                            path: 'custom-source-dir',
                            default: true,
                            package: 'Test Package Name',
                            versionName: "Spring '19",
                            versionNumber: '1.0.0.NEXT'
                        }
                    ]
                }),
                'custom-source-dir': {
                    dummy_directory1: {},
                    dummy_directory2: {},
                    lwc: {
                        module: {
                            'module.html': '',
                            'module.js':
                                'export default class Module extends LightningElement {}'
                        },
                        module2: {
                            'module2.html': '',
                            'module2.js':
                                'export default class Module extends NavigationMixin(LightningElement) {}'
                        },
                        module3: {
                            'module3.html': '',
                            'module3 .js': ''
                        }
                    },
                    dummy_directory3: {}
                }
            }
        });

        const expected: object[] = [
            {
                htmlName: 'c-module',
                jsName: 'c/module',
                namespace: 'c',
                name: 'module',
                url: '/preview/c/module',
                path: path.normalize(
                    'my-project/custom-source-dir/lwc/module/module.js'
                )
            },
            {
                htmlName: 'c-module2',
                jsName: 'c/module2',
                namespace: 'c',
                name: 'module2',
                url: '/preview/c/module2',
                path: path.normalize(
                    'my-project/custom-source-dir/lwc/module2/module2.js'
                )
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, returns modules in custom lwc directory nested inside force-app', () => {
        mock({
            'my-project': {
                'package.json': JSON.stringify({
                    name: 'test-project'
                }),
                'sfdx-project.json': JSON.stringify({
                    packageDirectories: [
                        {
                            path: 'force-app/main/default',
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
                                    'module.js':
                                        'export default class Module extends LightningElement {}'
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js':
                                        'export default class Module extends NavigationMixin(LightningElement) {}'
                                },
                                module3: {
                                    'module3.html': '',
                                    'module3 .js': ''
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
                url: '/preview/c/module',
                path: path.normalize(
                    'my-project/force-app/main/default/lwc/module/module.js'
                )
            },
            {
                htmlName: 'c-module2',
                jsName: 'c/module2',
                namespace: 'c',
                name: 'module2',
                url: '/preview/c/module2',
                path: path.normalize(
                    'my-project/force-app/main/default/lwc/module2/module2.js'
                )
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, handle project without lwc', () => {
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
                        default: {}
                    }
                }
            }
        });

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual([]);
    });
});

describe('ComponentIndex getProjectMetadata()', () => {
    afterEach(mock.restore);

    // usages of these functions during mocking the filesystem cause exceptions
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

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
                                    'module.js':
                                        'export default class Module extends LightningElement {}'
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js':
                                        'export default class Module2 extends LightningElement {}'
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
                            url: '/preview/c/module',
                            path: path.normalize(
                                'my-project/force-app/main/default/lwc/module/module.js'
                            )
                        },
                        {
                            htmlName: 'c-module2',
                            jsName: 'c/module2',
                            namespace: 'c',
                            name: 'module2',
                            url: '/preview/c/module2',
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
                                    'module.js':
                                        'export default class Module extends LightningElement {}'
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js':
                                        'export default class Module2 extends LightningElement {}'
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
                                    'module.js':
                                        'export default class Module extends LightningElement {}'
                                },
                                module4: {
                                    'module2.html': '',
                                    'module2.js':
                                        'export default class Module2 extends LightningElement {}'
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
                            url: '/preview/c/module',
                            path: path.normalize(
                                'my-project/force-app/main/default/lwc/module/module.js'
                            )
                        },
                        {
                            htmlName: 'c-module2',
                            jsName: 'c/module2',
                            namespace: 'c',
                            name: 'module2',
                            url: '/preview/c/module2',
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
                                    'module.js':
                                        'export default class Module extends LightningElement {}'
                                },
                                module2: {
                                    'module2.html': '',
                                    'module2.js':
                                        'export default class Module2 extends LightningElement {}'
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

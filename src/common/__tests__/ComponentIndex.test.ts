import fs from 'fs';
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
                            'module.js': ''
                        },
                        module2: {
                            'module2.html': '',
                            'module2.js': ''
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
                url: '/lwc/preview/namespace/module'
            },
            {
                htmlName: 'namespace-module2',
                jsName: 'namespace/module2',
                namespace: 'namespace',
                name: 'module2',
                url: '/lwc/preview/namespace/module2'
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });

    test('when using sfdx, returns modules in lwc directory', () => {
        mock({
            'my-project': {
                'package.json': '{}',
                'sfdx-project.json': '{}',
                src: {
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
                url: '/lwc/preview/c/module'
            },
            {
                htmlName: 'c-module2',
                jsName: 'c/module2',
                namespace: 'c',
                name: 'module2',
                url: '/lwc/preview/c/module2'
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });
});

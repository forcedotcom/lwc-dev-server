import fs from 'fs';
import mockFs from 'mock-fs';
import { ls } from 'shelljs';
import ComponentIndex from '../ComponentIndex';
import Project from '../Project';

describe('ComponentIndex', () => {
    afterEach(mockFs.restore);

    describe('getModules()', () => {
        it('when using sfdx, returns modules in lwc directory', () => {
            mockFs({
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
                    title: 'c-module',
                    url: '/lwc/preview/c/module'
                },
                {
                    title: 'c-module2',
                    url: '/lwc/preview/c/module2'
                }
            ];

            const project = new Project('my-project');
            const componentIndex = new ComponentIndex(project);

            expect(componentIndex.getModules()).toEqual(expected);
        });
    });

    it('when not sfdx, returns modules modulesSourceDirectory', () => {
        mockFs({
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
                title: 'namespace-module',
                url: '/lwc/preview/namespace/module'
            },
            {
                title: 'namespace-module2',
                url: '/lwc/preview/namespace/module2'
            }
        ];

        const project = new Project('my-project');
        const componentIndex = new ComponentIndex(project);

        expect(componentIndex.getModules()).toEqual(expected);
    });
});

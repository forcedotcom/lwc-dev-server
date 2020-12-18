/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import Project from '../Project';
import mock from 'mock-fs';
import path from 'path';
import { ServerConfiguration } from '../types';

const SRV_CONFIG: ServerConfiguration = {
    apiVersion: '49.0',
    instanceUrl: 'https://na1.salesforce.com'
};

const SRV_CONFIG_PORT: ServerConfiguration = {
    apiVersion: '49.0',
    instanceUrl: 'https://na1.salesforce.com',
    port: 3000
};

const sfdxProjectSinglePkg = {
    packageDirectories: [
        {
            path: 'modulesSrc'
        }
    ],
    namespace: '',
    sourceApiVersion: '50.0',
    sfdcLoginUrl: 'https://login.salesforce.com'
};

const sfdxProjectMultiPkg = {
    packageDirectories: [
        {
            path: 'modulesSrc',
            default: true
        },
        {
            path: 'moduleTwo'
        }
    ],
    namespace: '',
    sourceApiVersion: '50.0',
    sfdcLoginUrl: 'https://login.salesforce.com'
};

describe('project', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        mock.restore;
    });

    describe('finding the sfdx-project.json file', () => {
        test('should find a sfdx-project.json file in the current directory.', () => {
            mock({
                'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                modulesSrc: mock.directory({
                    items: {}
                })
            });

            const project = new Project('.', SRV_CONFIG);

            expect(project.isSfdxProjectJsonPresent('.')).toEqual(true);
        });

        test('should find a sfdx-project.json file in specified directory.', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: mock.directory({
                        items: {}
                    })
                }
            });

            const project = new Project('my-project', SRV_CONFIG);

            expect(project.isSfdxProjectJsonPresent('my-project')).toEqual(
                true
            );
        });

        test('should throw an exception when referencing a project without a sfdx-project.json', () => {
            mock({
                'invalid-project': {
                    // Empty
                },
                'my-project': {
                    'sfdx-project.json': '{}'
                }
            });
            try {
                new Project('invalid-project', SRV_CONFIG);
            } catch (e) {
                expect(e.message).toBe(
                    "Directory specified 'invalid-project' does not resolve to a valid Salesforce DX project."
                );
            }
        });
    });
    /*
    describe('processing the module source directory', () => {
        test('should handle a relative modulesSourceDirectory specified in the json config', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: mock.directory({
                        items: {}
                    })
                }
            });
            jest.spyOn(path, 'isAbsolute').mockReturnValueOnce(true);
            const project = new Project('my-project', SRV_CONFIG);
            const expected = path.join('my-project', 'modulesSrc');
            expect(project.modulesSourceDirectory).toBe(expected);
        });

        test('should log a warning when the modules source directory does not exist', () => {
            jest.spyOn(console, 'warn').mockImplementation();
            jest.spyOn(path, 'isAbsolute').mockReturnValueOnce(true);
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg)
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            const expected = path.join('my-project', 'modulesSrc');

            project.modulesSourceDirectory;
            expect(console.warn).toBeCalledWith(
                `modules source directory '${expected}' does not exist`
            );
        });
    });

    describe('port configuration', () => {
        test('should handle the port specified in the server config', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg)
                },
                'my-project/modulesSrc': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project', SRV_CONFIG_PORT);
            expect(project.port).toBe(3000);
        });

        test('should provide the default port when it is not specified in the server config', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg)
                },
                'my-project/modulesSrc': mock.directory({
                    items: {}
                })
            });

            const project = new Project('my-project', SRV_CONFIG);

            expect(project.port).toBe(3333);
        });
    });

    describe('when retrieving the custom labels path', () => {
        test('should find the custom labels in the specified package directory', () => {
            jest.spyOn(path, 'isAbsolute').mockReturnValueOnce(true);
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            const expected = path.join(
                'my-project',
                'modulesSrc',
                'labels',
                'CustomLabels.labels-meta.xml'
            );
            expect(project.customLabelsPath).toBe(expected);
        });

        test('should post a warning since no custom labels are defined in the project', () => {
            jest.spyOn(console, 'warn').mockImplementation();
            jest.spyOn(path, 'isAbsolute').mockReturnValueOnce(true);

            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        classes: {
                            'testClass.cls': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            const expectedLabels = path.join(
                'my-project',
                'modulesSrc',
                'labels',
                'CustomLabels.labels-meta.xml'
            );

            project.customLabelsPath;
            expect(console.warn).toBeCalledWith(
                `Custom labels '${expectedLabels}' were not found`
            );
        });
    });

    describe('content assets', () => {
        test('should find content assets in the specified package directory', () => {
            jest.spyOn(path, 'isAbsolute').mockReturnValue(true);
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file.txt': 'test content',
                            'file.png': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            expect(project.contentAssetsDirectories).toHaveLength(1);
            expect(project.contentAssetsDirectories[0]).toBe(
                path.join('my-project', 'modulesSrc', 'contentassets')
            );
        });

        test('should find content assets in a multi-package project', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectMultiPkg),
                    modulesSrc: {
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file.txt': 'test content',
                            'file.png': ''
                        }
                    },
                    moduleTwo: {
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file2.txt': 'test content',
                            'file2.png': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            expect(project.contentAssetsDirectories).toHaveLength(2);
            expect(project.contentAssetsDirectories.sort()).toStrictEqual([
                path.join('my-project', 'moduleTwo', 'contentassets'),
                path.join('my-project', 'modulesSrc', 'contentassets')
            ]);
        });
    }); */
});

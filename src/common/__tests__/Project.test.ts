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
    afterEach(mock.restore);

    describe('finding the sfdx-project.json file', () => {
        test('should find a sfdx-project.json file in the current directory.', () => {
            mock({
                'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                modulesSrc: {
                    lwc: mock.directory({
                        items: {}
                    })
                }
            });

            const project = new Project('.', SRV_CONFIG);

            expect(project.isSfdxProjectJsonPresent('.')).toEqual(true);
        });

        test('should find a sfdx-project.json file in specified directory.', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        })
                    }
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
                    "Directory specified 'invalid-project' does not resolve to a valid Salesforce DX project. More information about this at https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm"
                );
            }
        });

        test('should throw an exception when referencing a sfdx-project.json without packageDirectories', () => {
            const sfdxProjectWOPkgDirs = {
                namespace: '',
                sourceApiVersion: '50.0',
                sfdcLoginUrl: 'https://login.salesforce.com'
            };
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectWOPkgDirs),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        })
                    }
                }
            });
            try {
                new Project('my-project', SRV_CONFIG);
            } catch (e) {
                expect(e.message).toBe(
                    'No packageDirectories found on sfdx-project.json. More information about this at https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm'
                );
            }
        });
    });

    describe('processing the module source directory', () => {
        test('should handle a relative modulesSourceDirectory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        })
                    }
                }
            });
            jest.spyOn(path, 'isAbsolute').mockReturnValueOnce(true);
            const project = new Project('my-project', SRV_CONFIG);
            const expected = path.join('my-project', 'modulesSrc');
            expect(project.modulesSourceDirectory).toBe(expected);
        });

        test('should handle a modulesSourceDirectory in a multi-package project', () => {
            const sfdxProjectMultiPkgSample = {
                packageDirectories: [
                    {
                        path: 'moduleOne'
                    },
                    {
                        path: 'moduleTwo',
                        default: true
                    }
                ],
                namespace: '',
                sourceApiVersion: '50.0',
                sfdcLoginUrl: 'https://login.salesforce.com'
            };
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(
                        sfdxProjectMultiPkgSample
                    ),
                    moduleOne: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        }
                    },
                    moduleTwo: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        }
                    }
                }
            });
            const project = new Project('my-project', SRV_CONFIG);
            const expected = path.resolve('my-project/moduleTwo');
            expect(project.modulesSourceDirectory).toBe(expected);
        });

        test('should throw an error when the modules source directory does not have lwc components', () => {
            jest.spyOn(console, 'warn').mockImplementation();
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    moduleOne: mock.directory({
                        items: {}
                    })
                }
            });

            try {
                new Project('my-project', SRV_CONFIG);
            } catch (e) {
                expect(e.message).toBe(
                    `No 'lwc' directory found in path my-project/modulesSrc`
                );
            }
        });
    });

    describe('port configuration', () => {
        test('should handle the port specified in the server config', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        })
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG_PORT);
            expect(project.port).toBe(3000);
        });

        test('should provide the default port when it is not specified in the server config', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        })
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);

            expect(project.port).toBe(3333);
        });
    });

    describe('when retrieving the custom labels path', () => {
        test('should find the custom labels in the specified package directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            const expected = path.resolve(
                'my-project/modulesSrc/labels/CustomLabels.labels-meta.xml'
            );
            expect(project.customLabelsPath).toBe(expected);
        });

        test('should post a warning since no custom labels are defined in the project', () => {
            jest.spyOn(console, 'warn').mockImplementation();

            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        classes: {
                            'testClass.cls': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            const expectedLabels = path.resolve(
                'my-project/modulesSrc/labels/CustomLabels.labels-meta.xml'
            );

            project.customLabelsPath;
            expect(console.warn).toBeCalledWith(
                `Custom labels '${expectedLabels}' were not found`
            );
        });
    });

    describe('content assets', () => {
        test('should handle no content assets in the specified package directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            expect(project.contentAssetsDirectories).toHaveLength(0);
        });

        test('should find content assets in the specified package directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
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
                path.resolve('my-project/modulesSrc/contentassets')
            );
        });

        test('should find content assets in a multi-package project', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectMultiPkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file.txt': 'test content',
                            'file.png': ''
                        }
                    },
                    moduleTwo: {
                        lwc: mock.directory({
                            items: {}
                        }),
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
                path.resolve('my-project/moduleTwo/contentassets'),
                path.resolve('my-project/modulesSrc/contentassets')
            ]);
        });
    });

    describe('static resources', () => {
        test('should handle no static resources in the specified package directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
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
            expect(project.staticResourcesDirectories).toHaveLength(0);
        });

        test('should find static resources in the specified package directory', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectSinglePkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file.txt': 'test content',
                            'file.png': ''
                        },
                        staticresources: {
                            'my-image.jpg': 'test content',
                            'my-image.resource-meta.xml': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            expect(project.staticResourcesDirectories).toHaveLength(1);
            expect(project.staticResourcesDirectories[0]).toBe(
                path.resolve('my-project/modulesSrc/staticresources')
            );
        });

        test('should find static resources in a multi-package project', () => {
            mock({
                'my-project': {
                    'sfdx-project.json': JSON.stringify(sfdxProjectMultiPkg),
                    modulesSrc: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file.txt': 'test content',
                            'file.png': ''
                        },
                        staticresources: {
                            'my-image.jpg': 'test content',
                            'my-image.resource-meta.xml': ''
                        }
                    },
                    moduleTwo: {
                        lwc: mock.directory({
                            items: {}
                        }),
                        labels: {
                            'CustomLabels.labels-meta.xml': ''
                        },
                        contentassets: {
                            'file2.txt': 'test content',
                            'file2.png': ''
                        },
                        staticresources: {
                            'my-image2.jpg': 'test content',
                            'my-image2.resource-meta.xml': ''
                        }
                    }
                }
            });

            const project = new Project('my-project', SRV_CONFIG);
            expect(project.staticResourcesDirectories).toHaveLength(2);
            expect(project.staticResourcesDirectories.sort()).toStrictEqual([
                path.resolve('my-project/moduleTwo/staticresources'),
                path.resolve('my-project/modulesSrc/staticresources')
            ]);
        });
    });
});

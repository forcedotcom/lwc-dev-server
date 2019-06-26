import Dev from '../dev';
import * as Config from '@oclif/config';
import { JsonMap } from '@salesforce/ts-types';
import LocalDevServer from '../../../../../../server/LocalDevServer';
import Project from '../../../../../../common/Project';
import { SfdxError } from '@salesforce/core';
import LocalDevServerConfiguration from '../../../../../../user/LocalDevServerConfiguration';

jest.mock('../../../../../../server/LocalDevServer');
jest.mock('../../../../../../common/Project');

describe('dev', () => {
    let dev: Dev;

    afterEach(() => {});

    beforeEach(() => {
        dev = new Dev([], new Config.Config(<Config.Options>{}));
    });

    function setupAllDev() {
        setupUX();
        setupFlags();
        setupOrg();
        setupProject();
    }

    function setupUX() {
        Object.defineProperty(dev, 'ux', {
            get: () => {
                return { log: console.log };
            }
        });
    }

    function setupFlags() {
        Object.defineProperty(dev, 'flags', {
            get: () => {
                return {};
            }
        });
    }

    function setupOrg(version = '99.0') {
        Object.defineProperty(dev, 'org', {
            get: () => {
                return {
                    getConnection: () => {
                        return {
                            retrieveMaxApiVersion: () => version,
                            accessToken: 'testingAccessToken',
                            instanceUrl: 'http://test.instance.url'
                        };
                    },
                    getOrgId: () => {
                        return 'testingOrgIDX';
                    }
                };
            }
        });
    }

    function setupProject() {
        Object.defineProperty(dev, 'project', {
            get: () => {
                return {
                    getPath: () => 'C:\\sfdx\\project',
                    resolveProjectConfig: () => {
                        return Promise.resolve({
                            namespace: ''
                        });
                    }
                };
            }
        });
    }

    describe('run()', () => {
        test('run will launch local dev server', async () => {
            setupAllDev();

            let startCalled = false;
            // @ts-ignore
            LocalDevServer.mockImplementation(() => {
                return {
                    start: () => {
                        startCalled = true;
                    }
                };
            });

            let _configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration();
            Object.defineProperty(Project.prototype, 'configuration', {
                configurable: true,
                get: () => {
                    return _configuration;
                }
            });

            let result: JsonMap = (await dev.run()) as JsonMap;
            if (result) {
                expect(result['endpoint']).toEqual('http://test.instance.url');
                expect(result['orgId']).toEqual('testingOrgIDX');
                expect(result['api_version']).toEqual('99.0');
                expect(result['port']).toEqual(3333);

                expect(startCalled).toBeTruthy();
            } else {
                fail('result was nothing');
            }
        });

        test('run will return if org not defined', async () => {
            setupUX();
            setupFlags();
            let result = await dev.run();
            if (result) {
                expect((<JsonMap>result)['org']).toEqual('undefined');
                expect((<JsonMap>result).hasOwnProperty('org')).toBeTruthy();
            } else {
                fail('result was nothing');
            }
        });

        test('run will return if project not defined', async () => {
            setupUX();
            setupFlags();
            setupOrg();
            let result = await dev.run();
            if (result) {
                expect((<JsonMap>result)['project']).toEqual('undefined');
                expect(
                    (<JsonMap>result).hasOwnProperty('project')
                ).toBeTruthy();
            } else {
                fail('result was nothing');
            }
        });

        test('onProxyReq will add Authorization header', async () => {
            setupAllDev();

            let header = '';
            let request: { setHeader: Function } = {
                setHeader: function(name: string, value: string) {
                    header = `${name}: ${value}`;
                }
            };

            let _configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration();
            Object.defineProperty(Project.prototype, 'configuration', {
                configurable: true,
                get: () => {
                    return _configuration;
                }
            });
            let result = await dev.run();
            _configuration.onProxyReq(request, null, null);

            expect(header).toBe('Authorization: Bearer testingAccessToken');
        });

        test('uses port from flags', async () => {
            setupUX();
            setupOrg();
            setupProject();

            Object.defineProperty(dev, 'flags', {
                get: () => {
                    return { port: '5151' };
                }
            });

            let configuredPort = null;
            // @ts-ignore
            LocalDevServer.mockImplementation(() => {
                return {
                    start: (project: Project) => {
                        configuredPort = project.configuration.port;
                    }
                };
            });

            await dev.run();

            expect(configuredPort).toBe(5151);
        });
    });
});

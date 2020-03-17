import Start from '../start';
import * as Config from '@oclif/config';
import { JsonMap } from '@salesforce/ts-types';
import LocalDevServer from '../../../../../../server/LocalDevServer';
import Project from '../../../../../../common/Project';
import { SfdxError } from '@salesforce/core';
import LocalDevServerConfiguration from '../../../../../../user/LocalDevServerConfiguration';
import colors from 'colors';

jest.mock('../../../../../../server/LocalDevServer');
jest.mock('../../../../../../common/Project');

describe('start', () => {
    let start: Start;

    beforeEach(() => {
        start = new Start([], new Config.Config(<Config.Options>{}));
        setupConfigAggregator();
        const hubOrg = {
            getUsername: jest.fn()
        };
        Object.defineProperty(start, 'hubOrg', {
            get: () => {
                return hubOrg;
            }
        });

        // Setup project with a default configuration instance.
        const _configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration();
        Object.defineProperty(Project.prototype, 'configuration', {
            configurable: true,
            get: () => {
                return _configuration;
            }
        });
    });

    function setupAllDev() {
        setupUX();
        setupFlags();
        setupOrg();
        setupProject();
    }

    function setupConfigAggregator() {
        const configAggregator = { getPropertyValue: jest.fn() };
        Object.defineProperty(start, 'configAggregator', {
            get: () => {
                return configAggregator;
            }
        });
        return configAggregator;
    }

    function setupUX() {
        Object.defineProperty(start, 'ux', {
            get: () => {
                return {
                    log: jest.spyOn(console, 'log'),
                    error: jest.spyOn(console, 'error')
                };
            },
            configurable: true,
            enumerable: true
        });
    }

    function setupFlags() {
        Object.defineProperty(start, 'flags', {
            get: () => {
                return {};
            }
        });
    }

    function setupOrg(version = '99.0') {
        const org = {
            getConnection: () => {
                return {
                    retrieveMaxApiVersion: () => version,
                    accessToken: 'testingAccessToken',
                    instanceUrl: 'http://test.instance.url'
                };
            },
            getOrgId: () => {
                return 'testingOrgIDX';
            },
            getUsername: jest.fn(),
            refreshAuth: jest.fn()
        };
        Object.defineProperty(start, 'org', {
            get: () => {
                return org;
            }
        });
        return org;
    }

    function setupProject() {
        Object.defineProperty(start, 'project', {
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

            let initializeCalled = false;
            let startCalled = false;
            // @ts-ignore
            LocalDevServer.mockImplementation(() => {
                return {
                    initialize: () => {
                        initializeCalled = true;
                    },
                    start: () => {
                        startCalled = true;
                    }
                };
            });

            let result: JsonMap = (await start.run()) as JsonMap;
            if (result) {
                expect(result['endpoint']).toEqual('http://test.instance.url');
                expect(result['orgId']).toEqual('testingOrgIDX');
                expect(result['api_version']).toEqual('99.0');
                expect(result['port']).toEqual(3333);

                expect(initializeCalled).toBeTruthy();
                expect(startCalled).toBeTruthy();
            } else {
                fail('result was nothing');
            }
        });

        test('run will return if org not defined', async () => {
            setupUX();
            setupFlags();
            let result = await start.run();
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
            let result = await start.run();
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

            let result = await start.run();
            Project.prototype.configuration.onProxyReq(request, null, null);

            expect(header).toBe('Authorization: Bearer testingAccessToken');
        });

        // test('uses port from flags', async () => {
        //     setupUX();
        //     setupOrg();
        //     setupProject();

        //     Object.defineProperty(start, 'flags', {
        //         get: () => {
        //             return { port: '5151' };
        //         }
        //     });

        //     let configuredPort = null;
        //     // @ts-ignore
        //     LocalDevServer.mockImplementation(() => {
        //         return {
        //             start: (project: Project) => {
        //                 configuredPort = project.configuration.port;
        //             }
        //         };
        //     });

        //     await start.run();

        //     expect(configuredPort).toBe(5151);
        // });

        // test('outputs legal message', async () => {
        //     setupAllDev();
        //     const log = jest.fn();
        //     const error = jest.fn();
        //     Object.defineProperty(start, 'ux', {
        //         get: () => {
        //             return {
        //                 log,
        //                 error
        //             };
        //         },
        //         configurable: true,
        //         enumerable: true
        //     });

        //     const expected = colors.gray(
        //         'Use of this plugin is subject to the Salesforce.com Program Agreement. \nBy installing this plugin, you agree to the Salesforce.com Program Agreement<https://trailblazer.me/terms> \nand acknowledge the Salesforce Privacy Policy<https://www.salesforce.com/company/privacy.jsp>.\n'
        //     );

        //     await start.run();

        //     expect(log.mock.calls[0][0]).toEqual(expected);
        // });

        // test('uses port from flags', async () => {
        //     setupUX();
        //     setupOrg();
        //     setupProject();

        //     Object.defineProperty(start, 'flags', {
        //         get: () => {
        //             return { port: '5151' };
        //         }
        //     });

        //     let configuredPort = null;
        //     // @ts-ignore
        //     LocalDevServer.mockImplementation(() => {
        //         return {
        //             start: (project: Project) => {
        //                 configuredPort = project.configuration.port;
        //             }
        //         };
        //     });

        //     await start.run();

        //     expect(configuredPort).toBe(5151);
        // });

        // test('passes devhub user to LocalDevServer', async () => {
        //     setupAllDev();

        //     let actual;
        //     // @ts-ignore
        //     LocalDevServer.mockImplementation(devhubUser => {
        //         actual = devhubUser;
        //         return {
        //             start: () => {}
        //         };
        //     });
        //     // @ts-ignore
        //     start.hubOrg.getUsername.mockReturnValue('admin@devhub.org');

        //     await start.run();

        //     expect(actual).toBe('admin@devhub.org');
        // });
    });

    describe('reportStatus()', () => {
        beforeEach(() => {
            setupProject();
        });

        test('no org with specified targetusername reports invalid scratch org', async () => {
            const log = jest.fn();
            const error = jest.fn();
            Object.defineProperty(start, 'flags', {
                get: () => {
                    return { targetusername: 'user@org.com' };
                }
            });
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log,
                        error
                    };
                },
                configurable: true,
                enumerable: true
            });
            const expected = `\
Starting LWC Local Development.
    Dev Hub Org: ${colors.green('undefined')}
    Scratch Org: ${colors.red(
        "user@org.com - We can't find an active scratch org for this username or alias. You must have a Dev Hub org to create a scratch org."
    )}\
`;

            await start.run();

            expect(log.mock.calls[0][0]).toEqual(expected);
        });

        test('no org reports scratch org required', async () => {
            setupFlags();
            const log = jest.fn();
            const error = jest.fn();
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log,
                        error
                    };
                },
                configurable: true,
                enumerable: true
            });
            const expected = `\
Starting LWC Local Development.
    Dev Hub Org: ${colors.green('undefined')}
    Scratch Org: ${colors.red(
        "undefined - We can't find an active scratch org for this Dev Hub. Create one by following the steps in Create Scratch Orgs in the Salesforce DX Developer Guide (https://sfdc.co/cuuVX4) or the Local Development Server Getting Started."
    )}\
`;

            await start.run();

            expect(log.mock.calls[0][0]).toEqual(expected);
        });

        test('authenticating to inactive scratch org reports scratch org is inactive', async () => {
            setupFlags();
            const org = setupOrg();
            const log = jest.fn();
            const error = jest.fn();
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log,
                        error
                    };
                },
                configurable: true,
                enumerable: true
            });
            org.refreshAuth.mockImplementation(() => {
                throw 'expected';
            });
            org.getUsername.mockReturnValue('user@test.org');

            const expected = `\
Starting LWC Local Development.
    Dev Hub Org: ${colors.green('undefined')}
    Scratch Org: ${colors.red(
        'user@test.org - Error authenticating to your scratch org. Make sure that it is still active by running sfdx force:org:list --all.'
    )}
    Api Version: ${colors.green('99.0')}\
`;

            await start.run();

            expect(log.mock.calls[1][0]).toEqual(expected);
        });

        test('on org refresh, unhandledRejections for StatusCodeErrors are suppressed', async () => {
            setupFlags();
            const org = setupOrg();
            const log = jest.fn();
            const error = jest.fn();
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log,
                        error
                    };
                },
                configurable: true,
                enumerable: true
            });
            org.refreshAuth.mockImplementation(async () => {
                const err = new Error('foo');
                err.name = 'StatusCodeError';
                process.emit('unhandledRejection', err, Promise.reject(err));
                throw err;
            });

            await start.run();

            expect(error).not.toBeCalled();
        });

        test('on org refresh, unhandledRejections for other errors are not suppressed', async () => {
            setupFlags();
            const org = setupOrg();
            const log = jest.fn();
            const error = jest.fn();
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log,
                        error
                    };
                },
                configurable: true,
                enumerable: true
            });
            org.refreshAuth.mockImplementation(async () => {
                const err = new Error('test error');
                process.emit('unhandledRejection', err, Promise.reject(err));
                throw err;
            });

            await start.run();

            expect(error).toBeCalledWith(expect.stringMatching('test error'));
        });

        test('startup reports devhuborg, scratchorg and api version', async () => {
            setupFlags();
            const org = setupOrg();
            const log = jest.fn();
            const error = jest.fn();
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log,
                        error
                    };
                },
                configurable: true,
                enumerable: true
            });
            // @ts-ignore
            start.configAggregator.getPropertyValue.mockReturnValue(
                'admin@devhub.org'
            );
            org.getUsername.mockReturnValue('user@test.org');

            const expected = `\
Starting LWC Local Development.
    Dev Hub Org: ${colors.green('admin@devhub.org')}
    Scratch Org: ${colors.green('user@test.org')}
    Api Version: ${colors.green('99.0')}\
`;

            await start.run();

            expect(log.mock.calls[1][0]).toEqual(expected);
        });
    });
});

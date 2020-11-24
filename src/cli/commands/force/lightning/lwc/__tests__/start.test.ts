import Start, { errorCodes } from '../start';
import * as Config from '@oclif/config';
import { JsonMap } from '@salesforce/ts-types';
import LocalDevServer from '../../../../../../server/LocalDevServer';
import Project from '../../../../../../common/Project';
import { SfdxError } from '@salesforce/core';
import LocalDevServerConfiguration from '../../../../../../user/LocalDevServerConfiguration';
import * as fileUtils from '../../../../../../common/fileUtils';
import colors from 'colors';

jest.mock('../../../../../../server/LocalDevServer');
jest.mock('../../../../../../common/Project');
jest.mock('../../../../../../common/fileUtils');

// suppress noise from tests. there should be a better way to do this...
const unhandledRejectionListener = function(event: any) {};
process.addListener('unhandledRejection', unhandledRejectionListener);

describe('start', () => {
    let start: Start;
    let consoleLogMock: any;
    let consoleWarnMock: any;
    let consoleErrorMock: any;
    let findLWCFolderPathMock: any;
    beforeEach(() => {
        jest.resetAllMocks();

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

        consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
        consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        findLWCFolderPathMock = jest
            .spyOn(fileUtils, 'findLWCFolderPath')
            .mockImplementation(() => '/');
    });

    afterEach(() => {
        consoleLogMock.mockRestore();
        consoleWarnMock.mockRestore();
        consoleErrorMock.mockRestore();
    });

    afterAll(() => {
        process.removeListener(
            'unhandledRejection',
            unhandledRejectionListener
        );
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

            let startCalled = false;
            // @ts-ignore
            LocalDevServer.mockImplementation(() => {
                return {
                    start: () => {
                        startCalled = true;
                    }
                };
            });
            let result: JsonMap = (await start.run()) as JsonMap;
            if (result) {
                expect(result['endpoint']).toEqual('http://test.instance.url');
                expect(result['endpointHeaders']).toEqual([
                    'Authorization: Bearer testingAccessToken'
                ]);
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

        test('outputs legal message', async () => {
            setupAllDev();
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

            const expected = colors.gray(
                'Use of this plugin is subject to the Salesforce.com Program Agreement. \nBy installing this plugin, you agree to the Salesforce.com Program Agreement<https://trailblazer.me/terms> \nand acknowledge the Salesforce Privacy Policy<https://www.salesforce.com/company/privacy.jsp>.\n'
            );

            await start.run();

            expect(log.mock.calls[0][0]).toEqual(expected);
        });

        test('uses port from flags', async () => {
            setupUX();
            setupOrg();
            setupProject();

            Object.defineProperty(start, 'flags', {
                get: () => {
                    return { port: '5151' };
                }
            });

            let configuredPort = null;
            // @ts-ignore
            LocalDevServer.mockImplementation((project: Project) => {
                configuredPort = project.configuration.port;
                return {
                    start: jest.fn()
                };
            });

            await start.run();

            expect(configuredPort).toBe(5151);
        });
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

        test('authenticating to inactive scratch org reports should return exit code EPERM', async () => {
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
            const mockError = new Error('expected');
            org.refreshAuth.mockImplementation(() => {
                throw mockError;
            });
            org.getUsername.mockReturnValue('user@test.org');

            expect.assertions(1);
            await expect(start.run()).rejects.toMatchObject({
                exitCode: errorCodes.EPERM
            });
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
                throw new Error('expected');
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

            try {
                await start.run();
            } catch (err) {}
            expect(error).toBeCalledTimes(1);
            expect(error).toHaveBeenCalledWith(expected);
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

        describe('graceful termination', () => {
            let mockExit: jest.SpyInstance;

            beforeEach(() => {
                mockExit = jest
                    .spyOn(process, 'exit')
                    // @ts-ignore
                    .mockImplementation(() => {});
            });

            afterEach(() => {
                mockExit.mockRestore();
            });

            test('should handle graceful shutdown (SIGTERM)', async () => {
                setupFlags();
                setupOrg();
                Object.defineProperty(start, 'ux', {
                    get: () => {
                        return {
                            log: jest.fn(),
                            error: jest.fn()
                        };
                    },
                    configurable: true,
                    enumerable: true
                });

                const serverStart = jest.fn();
                const serverShutdown = jest.fn();
                (LocalDevServer as jest.Mock).mockImplementation(() => {
                    return {
                        start: serverStart,
                        shutdown: serverShutdown
                    };
                });

                await start.run();
                process.emit('SIGTERM', 'SIGTERM');

                expect(serverShutdown).toHaveBeenCalledTimes(1);
            });

            test('should handle graceful shutdown (SIGINT)', async () => {
                setupFlags();
                setupOrg();
                Object.defineProperty(start, 'ux', {
                    get: () => {
                        return {
                            log: jest.fn(),
                            error: jest.fn()
                        };
                    },
                    configurable: true,
                    enumerable: true
                });

                const serverStart = jest.fn();
                const serverShutdown = jest.fn();
                (LocalDevServer as jest.Mock).mockImplementation(() => {
                    return {
                        start: serverStart,
                        shutdown: serverShutdown
                    };
                });

                await start.run();
                process.emit('SIGINT', 'SIGINT');

                expect(serverShutdown).toHaveBeenCalledTimes(1);
            });
            test('lwc folder does not exists', async () => {
                setupFlags();
                setupOrg();
                Object.defineProperty(start, 'ux', {
                    get: () => {
                        return {
                            log: jest.fn(),
                            error: jest.fn()
                        };
                    },
                    configurable: true,
                    enumerable: true
                });
                findLWCFolderPathMock.mockReturnValueOnce(null);
                await start.run();
                expect(process.exit).toHaveBeenCalledTimes(1);
                expect(findLWCFolderPathMock).toHaveBeenCalledTimes(1);
            })
        });
    });
});

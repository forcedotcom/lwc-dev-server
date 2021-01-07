/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import Start from '../start';
import * as Config from '@oclif/config';
import { JsonMap } from '@salesforce/ts-types';
import LocalDevServer from '../../../../../../server/LocalDevServer';
import Project from '../../../../../../common/Project';
import LocalDevTelemetryReporter from '../../../../../../instrumentation/LocalDevTelemetryReporter';
import colors from 'colors';
import LocalDevServerConfiguration from '../../../../../../common/LocalDevServerConfiguration';
import { ServerConfiguration } from '../../../../../../common/types';

jest.mock('../../../../../../server/LocalDevServer');
jest.mock('../../../../../../common/Project');

// suppress noise from tests. there should be a better way to do this...
const unhandledRejectionListener = function(event: any) {};
process.addListener('unhandledRejection', unhandledRejectionListener);

const SRV_CONFIG: ServerConfiguration = {
    apiVersion: '49.0',
    instanceUrl: 'http://test.instance.url',
    headers: ['Authorization: Bearer testingAccessToken']
};

describe('force:lightning:lwc:start', () => {
    let start: Start;
    let consoleLogMock: any;
    let consoleWarnMock: any;
    let consoleErrorMock: any;
    const MockReporter = {
        trackApplicationStartError: jest.fn(),
        trackApplicationStartException: jest.fn(),
        initializeService: jest.fn()
    };

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
        const _configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            SRV_CONFIG
        );
        Object.defineProperty(Project.prototype, 'configuration', {
            configurable: true,
            get: () => {
                return _configuration;
            }
        });

        consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
        consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(LocalDevTelemetryReporter, 'getInstance').mockReturnValue(
            // @ts-ignore
            MockReporter
        );
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
        test('should launch local dev server', async () => {
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
                expect(result['api_version']).toEqual('49.0');
                expect(result['port']).toEqual(3333);

                expect(startCalled).toBeTruthy();
            } else {
                fail('result was nothing');
            }
        });

        // the oclif config has the Org value as required but we can't test that because
        // we are using jest vs mocha which is what the oclif framework provides for testing
        test('should throw a connection error since org is undefined', async () => {
            setupUX();
            setupFlags();
            try {
                await start.run();
            } catch (e) {
                expect(e.message).toEqual(
                    `Cannot read property 'getConnection' of undefined`
                );
            }
        });

        test('should output legal message', async () => {
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
    });

    describe('reportStatus()', () => {
        beforeEach(() => {
            setupProject();
        });

        test('should return error when authenticating to inactive org', async () => {
            setupFlags();
            const reporter = LocalDevTelemetryReporter.getInstance();
            jest.spyOn(reporter, 'trackApplicationStartError');
            const org = setupOrg();
            const log = jest.fn();
            Object.defineProperty(start, 'ux', {
                get: () => {
                    return {
                        log
                    };
                },
                configurable: true,
                enumerable: true
            });
            org.refreshAuth.mockImplementation(() => {
                throw new Error('Authentication error');
            });
            org.getUsername.mockReturnValue('user@test.org');

            try {
                await start.run();
            } catch (err) {
                expect(err.message).toEqual('Authentication error');
            }
        });

        test('should report username and api version', async () => {
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

            const expected = `\nStarting LWC Local Development.\n\tUsername: ${colors.green(
                'user@test.org'
            )}\n\tApi Version: ${colors.green('49.0')}\n`;

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
        });
    });
});

import mockFs from 'mock-fs';
import { getCustomComponentService } from '../CustomComponentService';
import { compile } from '@webruntime/compiler';
import {
    AddressableService,
    ContainerContext,
    PublicConfig,
    RequestOutputTypes,
    RequestParams,
    RequestService
} from '@webruntime/api';
import * as path from 'path';

jest.mock('@webruntime/compiler');

describe('CustomComponentService', () => {
    let customComponentService: AddressableService & RequestService;

    beforeEach(() => {
        const CustomComponentService = getCustomComponentService(
            'c',
            '/sfdxProject/force-app/main/default'
        );

        const config: PublicConfig = {
            projectDir: '/sfdcProject',
            buildDir: '/sfdxProject/.localdevserver',
            server: {
                basePath: '',
                resourceRoot: '/webruntime'
            },
            compilerConfig: {
                format: 'amd',
                formatConfig: {
                    amd: { define: 'Webruntime.define' }
                },
                inlineConfig: []
            }
        };

        customComponentService = new CustomComponentService(config);
    });

    afterEach(() => {
        (compile as jest.Mock).mockReset();
    });

    it('should set the uri', () => {
        expect(customComponentService.uri).toEqual(
            '/custom-component/:uid/:mode/:locale/c/:name'
        );
    });

    describe('mappings', () => {
        beforeEach(() => {
            mockFs({
                '/sfdxProject/force-app/main/default': {
                    lwc: {
                        moduleA: {
                            'moduleA.js': '',
                            'moduleA.html': ''
                        },
                        moduleB: {
                            'moduleB.js': '',
                            'moduleB.html': '',
                            'moduleB.css': ''
                        }
                    },
                    aura: {
                        componentA: {
                            'componentA.cmp': '',
                            'componentA.css': '',
                            'componentAController.js': ''
                        }
                    }
                }
            });
        });

        afterEach(() => {
            mockFs.restore();
        });

        it('returns mappings for lwc modules using the custom components namespace', () => {
            const expectedMappings = {
                'c/': '/custom-component/:uid/:mode/:locale/c/'
            };

            expect(customComponentService.mappings).toEqual(expectedMappings);
        });
    });

    describe('toSpecifier', () => {
        it('returns a specifier using the custom components namespace', () => {
            const url = '/webruntime/custom-component/latest/dev/en_US/c/clock';
            expect(customComponentService.toSpecifier(url)).toEqual('c/clock');
        });
    });

    describe('requests', () => {
        it('calls compile with the correct namespace and base dir', async () => {
            const params: RequestParams = {
                mode: 'dev',
                locale: 'en_US'
            };

            const context: ContainerContext = {
                metadata: {
                    importMap: {
                        imports: {}
                    }
                },
                compilerConfig: {
                    baseDir: '/originalBaseDir'
                }
            };

            (compile as jest.Mock).mockReturnValue({
                result: {},
                metadata: {},
                diagnostics: [],
                success: true
            });

            const result = await customComponentService.request(
                'c/moduleA',
                params,
                context
            );

            expect(compile).toHaveBeenCalledTimes(1);
            expect(compile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'moduleA',
                    namespace: 'lwc',
                    baseDir: '/sfdxProject/force-app/main/default'
                })
            );

            expect(result.type).toEqual(RequestOutputTypes.COMPONENT);
            expect(result.specifier).toEqual('c/moduleA');
            expect(result.resource).toBeDefined();
        });

        it('should return diagnostics error when compile fails', async () => {
            const params: RequestParams = {
                mode: 'dev',
                locale: 'en_US'
            };

            const context: ContainerContext = {
                metadata: {
                    importMap: {
                        imports: {}
                    }
                },
                compilerConfig: {
                    baseDir: '/originalBaseDir'
                }
            };

            (compile as jest.Mock).mockReturnValue({
                result: {},
                metadata: {},
                diagnostics: [
                    {
                        code: 'PLUGIN_ERROR',
                        message: `"SyntaxError: /path/to/lwc/moduleA/moduleA.js: LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"
[0m [90m 4 | [39m    timestamp [33m=[39m [36mnew[39m [33mDate[39m()[33m;[39m[0m
[0m [90m 5 | [39m[0m
[0m[31m[1m>[22m[39m[90m 6 | [39m    [33m@[39mapi[0m
[0m [90m   | [39m    [31m[1m^[22m[39m[0m
[0m [90m 7 | [39m    refresh() {[0m
[0m [90m 8 | [39m        [36mthis[39m[33m.[39mtimestamp [33m=[39m [36mnew[39m [33mDate[39m()[33m;[39m[0m
[0m [90m 9 | [39m    }[0m"`,
                        filename: '/path/to/lwc/moduleA/moduleA.js',
                        level: 1,
                        location: {
                            line: 6,
                            column: 4,
                            start: 128,
                            length: 63
                        }
                    }
                ],
                success: true
            });

            const result = await customComponentService.request(
                'c/moduleA',
                params,
                context
            );

            expect(compile).toHaveBeenCalledTimes(1);
            expect(compile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'moduleA',
                    namespace: 'lwc',
                    baseDir: '/sfdxProject/force-app/main/default'
                })
            );

            expect(result.type).toEqual(RequestOutputTypes.JSON);
            expect(result.specifier).toEqual('c/moduleA');
            expect(result.resource).toBeDefined();
            // @ts-ignore
            expect(result.resource.json.errors[0].filename).toEqual(
                '/path/to/lwc/moduleA/moduleA.js'
            );
            // @ts-ignore
            expect(result.resource.json.errors[0].location).toEqual({
                line: 6,
                column: 4,
                start: 128,
                length: 63
            });
            // @ts-ignore
            expect(result.resource.json.errors[0].message).toContain(
                `SyntaxError:  LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from \"lwc\"`
            );
            // @ts-ignore
            expect(result.resource.json.errors[0].code).toContain(
                '\n  4 |     timestamp = new Date();\n  5 | \n> 6 |     @api\n    |     ^\n  7 |     refresh() {\n  8 |         this.timestamp = new Date();\n  9 |     }'
            );
        });

        it('should return component when precompile diagnostics are present', async () => {
            const params: RequestParams = {
                mode: 'dev',
                locale: 'en_US'
            };

            const context: ContainerContext = {
                metadata: {
                    importMap: {
                        imports: {}
                    }
                },
                compilerConfig: {
                    baseDir: '/originalBaseDir'
                }
            };

            (compile as jest.Mock).mockReturnValue({
                result: {},
                metadata: {},
                diagnostics: [
                    {
                        code: 1002,
                        message: 'test message',
                        level: 2
                    }
                ],
                success: true
            });

            const result = await customComponentService.request(
                'c/moduleA',
                params,
                context
            );

            expect(compile).toHaveBeenCalledTimes(1);
            expect(compile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'moduleA',
                    namespace: 'lwc',
                    baseDir: '/sfdxProject/force-app/main/default'
                })
            );

            expect(result.type).toEqual(RequestOutputTypes.COMPONENT);
            expect(result.specifier).toEqual('c/moduleA');
            expect(result.resource).toBeDefined();
        });

        it('throws an error for invalid specifiers', async () => {
            const params: RequestParams = {
                mode: 'dev',
                locale: 'en_US'
            };

            const context: ContainerContext = {
                metadata: {
                    importMap: {
                        imports: {}
                    }
                },
                compilerConfig: {
                    baseDir: '/originalBaseDir'
                }
            };

            await expect(
                customComponentService.request('c-module', params, context)
            ).rejects.toThrow('Invalid specifier for custom component');
        });
    });
});
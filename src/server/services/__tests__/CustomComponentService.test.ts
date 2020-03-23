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
        compile.mockReset();
    });

    it('should set the uri', () => {
        expect(customComponentService.uri).toEqual(
            '/custom-component/:uid/:mode/:locale/:namespace/:name'
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
                'c/moduleA': '/custom-component/:uid/:mode/:locale/c/moduleA',
                'c/moduleB': '/custom-component/:uid/:mode/:locale/c/moduleB'
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

            compile.mockReturnValue({
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

import { ResourceUrlService } from '../ResourceUrlService';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';
import { PublicConfig } from '@webruntime/api';
import { CONTENT_ASSETS, STATIC_RESOURCES } from '../../Constants';

jest.mock('@webruntime/server/dist/commonjs/utils/utils');

describe('ResourceUrlService', () => {
    let config: PublicConfig;

    beforeEach(() => {
        (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');

        config = {
            projectDir: '/sfdcProject',
            buildDir: '/sfdxProject/.localdevserver',
            server: {
                basePath: '',
                resourceRoot: '/webruntime'
            },
            compilerConfig: {},
            additionalProperties: {}
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns a rollup plugin', () => {
        const service = new ResourceUrlService(config);
        expect(service.getPlugin()).toBeTruthy();
    });

    describe('rollup plugin', () => {
        describe('resolveId', () => {
            it('should resolve ids starting with @salesforce/resourceUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId(
                    '@salesforce/resourceUrl/chartJs'
                );
                expect(resolved).toBe('@salesforce/resourceUrl/chartJs');
            });

            it('should resolve ids starting with @salesforce/contentAssetUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId(
                    '@salesforce/contentAssetUrl/recipes_sq_logo'
                );
                expect(resolved).toBe(
                    '@salesforce/contentAssetUrl/recipes_sq_logo'
                );
            });

            it('should return null for ids not starting with @salesforce/resourceUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId('resourceUrl/chartJs');
                expect(resolved).toBeNull();
            });

            it('should return null for ids not starting with @salesforce/contentAssetUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId(
                    'contentAssetUrl/recipes_sq_logo'
                );
                expect(resolved).toBeNull();
            });
        });

        describe('load', () => {
            it('should replace @salesforce/resourceUrl imports', () => {
                (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');

                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();
                const resolved = plugin.load('@salesforce/resourceUrl/chartJs');

                expect(resolved).toBe(
                    `export default '/assets/project/158104e2eb/${STATIC_RESOURCES}/chartJs';`
                );
            });

            it('should replace @salesforce/contentAssetUrl imports', () => {
                (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');

                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();
                const resolved = plugin.load(
                    '@salesforce/contentAssetUrl/recipes_sq_logo'
                );

                expect(resolved).toBe(
                    `export default '/assets/project/158104e2eb/${CONTENT_ASSETS}/recipes_sq_logo';`
                );
            });

            it('should not replace ids not starting with @salesforce/resourceUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();
                const resolved = plugin.load('resourceUrl/chartJs');

                expect(resolved).toBeNull();
            });

            it('should not replace ids not starting with @salesforce/contentAssetUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();
                const resolved = plugin.load('contentAssetUrl/recipes_sq_logo');

                expect(resolved).toBeNull();
            });
        });
    });
});

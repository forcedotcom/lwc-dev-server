import { ResourceUrlService } from '../ResourceUrlService';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';
import { PublicConfig } from '@webruntime/api';

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
            compilerConfig: {}
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

            it('should return null for ids not starting with @salesforce/resourceUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId('resourceUrl/chartJs');
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
                    `export default '/assets/project/158104e2eb/chartJs';`
                );
            });

            it('should not replace ids not starting with @salesforce/resourceUrl', () => {
                const service = new ResourceUrlService(config);
                const plugin = service.getPlugin();
                const resolved = plugin.load('resourceUrl/chartJs');

                expect(resolved).toBeNull();
            });
        });
    });
});

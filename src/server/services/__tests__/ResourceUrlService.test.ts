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
            compilerConfig: {
                format: 'amd',
                formatConfig: {
                    amd: { define: 'Webruntime.define' }
                },
                inlineConfig: []
            }
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
            it.todo('should resolve ids starting with @salesforce/resourceUrl');
            it.todo(
                'should return null for ids not starting with @salesforce/resourceUrl'
            );
        });
        describe('load', () => {
            it.todo('should replace @salesforce/resourceUrl imports');
            it.todo(
                'should not replace ids not starting with @salesforce/resourceUrl'
            );
        });
    });
});

import { ApexContinuationService } from '../ApexContinuationService';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';
import { PublicConfig } from '@webruntime/api';

jest.mock('@webruntime/server/dist/commonjs/utils/utils');

describe('ApexContinuationService', () => {
    let config: PublicConfig;

    beforeEach(() => {
        (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns a rollup plugin', () => {
        const service = new ApexContinuationService();
        expect(service.getPlugin()).toBeTruthy();
    });

    describe('rollup plugin', () => {
        describe('resolveId', () => {
            it('should resolve paths with @salesforce/apexContinuation', () => {
                const service = new ApexContinuationService();
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId(
                    '@salesforce/apexContinuation/SampleContinuationClass.startRequest'
                );
                expect(resolved).toBe(
                    '@salesforce/apexContinuation/SampleContinuationClass.startRequest'
                );
            });

            it('should resolve to null for paths not starting with @salesforce/apexContinuation', () => {
                const service = new ApexContinuationService();
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId(
                    '@salesforce/apex/SampleContinuationClass.startRequest'
                );
                expect(resolved).toBeNull();
            });
        });

        describe('load', () => {
            it('should throw error for @salesforce/apexContinuation imports', () => {
                (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');

                const service = new ApexContinuationService();
                const plugin = service.getPlugin();
                function loadApexContinuation() {
                    plugin.load(
                        '@salesforce/apexContinuation/SampleContinuationClass.startRequest'
                    );
                }
                expect(loadApexContinuation).toThrowErrorMatchingSnapshot();
            });

            it('should return null instead of throwing error for other than @salesforce/apexContinuation imports', () => {
                const service = new ApexContinuationService();
                const plugin = service.getPlugin();
                const resolved = plugin.load(
                    '@salesforce/apex/SampleContinuationClass.startRequest'
                );

                expect(resolved).toBeNull();
            });
        });
    });
});

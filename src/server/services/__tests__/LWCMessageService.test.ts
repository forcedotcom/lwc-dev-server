import { LWCMessageService } from '../LWCMessageService';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';
import { PublicConfig } from '@webruntime/api';

jest.mock('@webruntime/server/dist/commonjs/utils/utils');

describe('LWCMessageService', () => {
    let config: PublicConfig;

    beforeEach(() => {
        (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns a rollup plugin', () => {
        const service = new LWCMessageService();
        expect(service.getPlugin()).toBeTruthy();
    });

    describe('rollup plugin', () => {
        describe('resolveId', () => {
            it('should resolve paths with @salesforce/messageChannel', () => {
                const service = new LWCMessageService();
                const plugin = service.getPlugin();

                const resolved = plugin.resolveId(
                    '@salesforce/messageChannel/SampleMessageChannel__c'
                );
                expect(resolved).toBe(
                    '@salesforce/messageChannel/SampleMessageChannel__c'
                );
            });
        });

        describe('load', () => {
            it('should throw error for @salesforce/messageChannel imports', () => {
                (getLatestVersion as jest.Mock).mockReturnValue('158104e2eb');

                const service = new LWCMessageService();
                const plugin = service.getPlugin();
                function loadApexContinuation() {
                    plugin.load(
                        '@salesforce/messageChannel/SampleMessageChannel__c'
                    );
                }
                expect(loadApexContinuation).toThrowErrorMatchingSnapshot();
            });

            it('should return null instead of throwing error for other than @salesforce/messageChannel imports', () => {
                const service = new LWCMessageService();
                const plugin = service.getPlugin();
                const resolved = plugin.load(
                    './lightningMessageService.html'
                );

                expect(resolved).toBeNull();
            });
        });
    });
});

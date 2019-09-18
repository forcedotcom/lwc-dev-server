import salesforceApexWireResolver from '../rollup-plugin-salesforce-apex';

describe('salesforceApexWireResolver', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('resolveId', () => {
        it('Resolves @salesforce imports', () => {
            const id = '@salesforce/apex/Conroller.method';

            const plugin = salesforceApexWireResolver();

            expect(plugin.resolveId(id)).toBeTruthy();
        });

        it('returns null when the resolve does not match', () => {
            const id = 'forcedotcom/notapex';

            const plugin = salesforceApexWireResolver();

            expect(plugin.resolveId(id)).toBeNull();
        });
    });

    describe('load', () => {
        it('loads the apex invoker from lds', () => {
            const id = '@salesforce/apex/Controller.method';

            const plugin = salesforceApexWireResolver();
            const actual = plugin.load(id);

            expect(actual).toBe(
                `
import { getApexInvoker, generateGetApexWireAdapter } from 'force/lds';
import { register } from 'wire-service';

const apexInvoker = getApexInvoker("", "Controller", "method", false);
register(apexInvoker, generateGetApexWireAdapter("", "Controller", "method", false));
export default apexInvoker;
`
            );
        });

        it('handles @salesforce/apex', () => {
            const id = '@salesforce/apex';

            const plugin = salesforceApexWireResolver();
            const actual = plugin.load(id);

            expect(actual).toBe(
                `
export { refresh as refreshApex, getSObjectValue } from 'force/lds';
`
            );
        });
    });
});

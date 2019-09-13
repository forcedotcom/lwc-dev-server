import salesforceApexWireResolver from '../rollup-plugin-salesforce-apex';

describe('salesforceApexWireResolver', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('resolveId', () => {
        it('Resolves @salesforce imports', () => {
            const id = '@salesforce/apex/Conroller';

            const plugin = salesforceApexWireResolver();

            expect(plugin.resolveId(id)).toBeTruthy();
        });
    });

    describe('load', () => {
        it('loads the apex invoker from lds', () => {
            const id = '@salesforce/apex/Conroller';

            const plugin = salesforceApexWireResolver();
            const actual = plugin.load(id);
        });
    });
});

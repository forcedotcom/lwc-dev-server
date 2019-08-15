import mockFs from 'mock-fs';
import labelResolver from '../labelResolver';

const SAMPLE_CUSTOM_LABELS = `
<?xml version="1.0" encoding="UTF-8"?>
<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
    <labels>
        <fullName>nathan_name</fullName>
        <categories>test</categories>
        <language>en_US</language>
        <protected>true</protected>
        <shortDescription>Nathan&#39;s Name</shortDescription>
        <value>Nathan McWilliams</value>
    </labels>
    <labels>
        <fullName>nathan_location</fullName>
        <categories>test</categories>
        <language>en_US</language>
        <protected>true</protected>
        <shortDescription>Nathan&#39;s Location</shortDescription>
        <value>Atlantis</value>
    </labels>
</CustomLabels>
`;

describe('labelResolver', () => {
    afterEach(() => {
        mockFs.restore();
        jest.restoreAllMocks();
    });

    it('throws error when a custom labels file is specified but doesnt exist', () => {
        const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
        mockFs({
            [customLabelsPath]: SAMPLE_CUSTOM_LABELS
        });

        try {
            labelResolver({
                customLabelsPath: 'src/does-not-exist.xml'
            });
        } catch (e) {
            expect(e.message).toBe(
                "labels file 'src/does-not-exist.xml' does not exist"
            );
        }
    });

    it('doesnt throw an error if a custom label file is undefined', () => {
        const customLabelsPath = undefined;
        labelResolver({ customLabelsPath });
        // no error
    });

    it('doesnt throw an error if a custom label file is not specified', () => {
        labelResolver();
        // no error
    });

    describe('toProxiedObject', () => {
        describe('custom labels', () => {
            it('returns the label value when the label exists', () => {
                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: SAMPLE_CUSTOM_LABELS
                });

                const resolver = labelResolver({ customLabelsPath });
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_name'];
                const expected = 'Nathan McWilliams';
                expect(actual).toBe(expected);
            });

            it('returns a placeholder when the label doesnt exist', () => {
                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: SAMPLE_CUSTOM_LABELS
                });

                const resolver = labelResolver({ customLabelsPath });
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_foo'];
                const expected = '{unknown label: c.nathan_foo}';
                expect(actual).toBe(expected);
            });

            it('returns a placeholder when no label file is specified', () => {
                const resolver = labelResolver();
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_name'];
                const expected = '{unknown label: c.nathan_name}';
                expect(actual).toBe(expected);
            });

            it('returns a placeholder when label file exists but is empty', () => {
                let message = '';
                jest.spyOn(console, 'warn').mockImplementation(args => {
                    message = args;
                });

                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: `<?xml version="1.0" encoding="UTF-8"?>
                    <CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata"></CustomLabels>
                    `
                });

                const resolver = labelResolver({ customLabelsPath });
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_name'];
                const expected = '{unknown label: c.nathan_name}';
                expect(actual).toBe(expected);

                expect(console.warn).toBeCalledTimes(1);
                expect(message).toContain('did not have expected format');
            });

            it('returns a placeholder when the label file is malformed', () => {
                let message = '';
                jest.spyOn(console, 'warn').mockImplementation(args => {
                    message = args;
                });

                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: `<?xml version="1.0" encoding="UTF-8"?>
                    <CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata" CustomLabels>
                    `
                });

                const resolver = labelResolver({ customLabelsPath });
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_name'];
                const expected = '{unknown label: c.nathan_name}';
                expect(actual).toBe(expected);

                expect(console.warn).toBeCalledTimes(1);
                expect(message).toContain('did not have expected format');
            });

            it('returns a placeholder when the label file is missing values', () => {
                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: `<?xml version="1.0" encoding="UTF-8"?>
                    <CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
                        <labels>
                            <fullName>nathan_name</fullName>
                        </labels>
                    </CustomLabels>`
                });

                const resolver = labelResolver({ customLabelsPath });
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_name'];
                const expected = '{unknown label: c.nathan_name}';
                expect(actual).toBe(expected);
            });

            it('returns a placeholder when the label has an empty value', () => {
                // an empty value is not valid
                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: `<?xml version="1.0" encoding="UTF-8"?>
                    <CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
                        <labels>
                            <fullName>nathan_name</fullName>
                            <categories>test</categories>
                            <language>en_US</language>
                            <protected>true</protected>
                            <shortDescription></shortDescription>
                            <value></value>
                        </labels>
                    </CustomLabels>`
                });

                const resolver = labelResolver({ customLabelsPath });
                const labels = resolver.createProxiedObject();

                const actual = labels['c']['nathan_name'];
                const expected = '{unknown label: c.nathan_name}';
                expect(actual).toBe(expected);
            });

            it('returns undefined when getter called with symbol', () => {
                const customLabelsPath = 'labels/CustomLabels.labels-meta.xml';
                mockFs({
                    [customLabelsPath]: SAMPLE_CUSTOM_LABELS
                });

                const resolver = labelResolver({
                    customLabelsPath
                });
                const labels = resolver.createProxiedObject();

                const symbol = Symbol('foo');
                // @ts-ignore
                const actual = labels['c'][symbol];
                expect(actual).toBeUndefined();
            });
        });
    });
});

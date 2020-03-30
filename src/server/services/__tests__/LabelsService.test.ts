import mockFs from 'mock-fs';
import { getLabelService } from '../LabelsService';
import { compile } from '@webruntime/compiler';
import { RequestParams, ContainerContext } from '@webruntime/api';

jest.mock('@webruntime/compiler');

const CUSTOM_LABELS_PATH = 'labels/CustomLabels.labels-meta.xml';
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

const REQUEST_PARAMS: RequestParams = {
    mode: 'dev',
    locale: 'en_US'
};

const CONTAINER_CONTEXT: ContainerContext = {
    metadata: {
        importMap: {
            imports: {}
        }
    },
    compilerConfig: {
        baseDir: '/'
    }
};

describe('getLabelService', () => {
    beforeEach(() => {
        mockFs({
            [CUSTOM_LABELS_PATH]: SAMPLE_CUSTOM_LABELS
        });
    });

    afterEach(() => {
        mockFs.restore();
        jest.restoreAllMocks();
        // @ts-ignore
        compile.mockReset();
    });

    describe('customLabelsFile', () => {
        it('throws error when a custom labels file is specified but doesnt exist', async () => {
            try {
                const Service = getLabelService('src/does-not-exist.xml');
                const labelsService = new Service();
                await labelsService.initialize();

                fail(
                    'Should have thrown an exception on trying to load a file that does not exist'
                );
            } catch (e) {
                expect(e.message).toBe(
                    "Labels file 'src/does-not-exist.xml' does not exist"
                );
            }
        });

        it('doesnt throw an error if a custom label file is undefined', async () => {
            const Service = getLabelService(CUSTOM_LABELS_PATH);
            const labelsService = new Service();
            await labelsService.initialize();
            // no error
        });

        it('doesnt throw an error if a custom label file is not specified', async () => {
            const Service = getLabelService();
            const labelsService = new Service();
            await labelsService.initialize();
            // no error
        });
    });
    it('resolves the scope import from the uri ', async () => {
        const Service = getLabelService(CUSTOM_LABELS_PATH);
        const labelsService = new Service();
        await labelsService.initialize();

        debugger;
        const specifier = labelsService.toSpecifier(
            '/salesforce/label/dev/en/c.labelId'
        );
        expect(specifier).toBe('@salesforce/label/c.labelId');
    });

    describe('request()', () => {
        it('returns a compiled label', async () => {
            const compilerOutput = {
                result: 'compiler_output',
                metadata: {
                    dependencies: ['metadata_dependencies'],
                    dynamicImports: []
                },
                success: true,
                diagnostics: ['compiler_diagnostics']
            };
            // @ts-ignore
            compile.mockImplementation(() => {
                return compilerOutput;
            });

            const Service = getLabelService(CUSTOM_LABELS_PATH);
            const labelsService = new Service();
            await labelsService.initialize();

            const result = await labelsService.request(
                '@salesforce/label/c.nathan_name',
                REQUEST_PARAMS,
                CONTAINER_CONTEXT
            );

            expect(result).toMatchObject({
                resource: 'compiler_output',
                metadata: {
                    dependencies: ['metadata_dependencies'],
                    dynamicImports: []
                },
                success: true,
                diagnostics: ['compiler_diagnostics']
            });
        });

        it('returns a compiler error when compileLabel returns undefined', async () => {
            // @ts-ignore
            compile.mockImplementation(() => {
                return undefined;
            });

            const Service = getLabelService(CUSTOM_LABELS_PATH);
            const labelsService = new Service();
            await labelsService.initialize();

            const result = await labelsService.request(
                '@salesforce/label/c.newLabelDoesntExist',
                REQUEST_PARAMS,
                CONTAINER_CONTEXT
            );

            expect(result).toMatchObject({
                type: 'component',
                specifier: '@salesforce/label/c.newLabelDoesntExist',
                success: false,
                diagnostics: [
                    {
                        code: -1,
                        message: 'Compiler output undefined or null',
                        level: 0
                    }
                ]
            });
        });

        it('compiles the label when not previously compiled', async () => {
            const Service = getLabelService(CUSTOM_LABELS_PATH);
            const labelsService = new Service();
            await labelsService.initialize();

            await labelsService.request(
                '@salesforce/label/c.nathan_name',
                REQUEST_PARAMS,
                CONTAINER_CONTEXT
            );

            expect(compile).toHaveBeenCalled();
        });

        it('should not compile the label when it was already compiled previously', async () => {
            const Service = getLabelService(CUSTOM_LABELS_PATH);
            const labelsService = new Service();
            await labelsService.initialize();

            // @ts-ignore
            compile.mockImplementation(() => {
                return { success: true };
            });

            await labelsService.request(
                '@salesforce/label/c.nathan_name',
                REQUEST_PARAMS,
                CONTAINER_CONTEXT
            );
            await labelsService.request(
                '@salesforce/label/c.nathan_name',
                REQUEST_PARAMS,
                CONTAINER_CONTEXT
            );

            expect(compile).toHaveBeenCalledTimes(1);
        });

        it('passes the label as a file to the compiler', async () => {
            const Service = getLabelService(CUSTOM_LABELS_PATH);
            const labelsService = new Service();
            await labelsService.initialize();

            await labelsService.request(
                '@salesforce/label/c.nathan_name',
                REQUEST_PARAMS,
                CONTAINER_CONTEXT
            );

            // @ts-ignore
            const files = compile.mock.calls[0][0].files;

            expect(Object.keys(files)[0]).toEqual(
                '@salesforce/label/c.nathan_name.js'
            );
            expect(files[Object.keys(files)[0]]).toEqual(
                'export default "Nathan McWilliams"'
            );
        });
    });

    describe('namespace support', () => {
        it.todo(
            'should resolve label requests using the namespace of the project'
        );
    });

    describe('getPlugin', () => {
        describe('resolveId()', () => {
            it('Returns null for non @salesforce/label scoped values', async () => {
                const Service = getLabelService(CUSTOM_LABELS_PATH);
                const labelsService = new Service();
                await labelsService.initialize();
                const plugin = labelsService.getPlugin({});

                // Ignore needed till webruntime fixes its type issues
                // @ts-ignore [W-7386428]
                expect(plugin.resolveId('label/someLabel')).toBeNull();
            });
            it('Converts specifier to file path when prefixed with @salesforce/label', async () => {
                const Service = getLabelService(CUSTOM_LABELS_PATH);
                const labelsService = new Service();
                await labelsService.initialize();
                const plugin = labelsService.getPlugin({});

                // Ignore needed till webruntime fixes its type issues
                // @ts-ignore
                expect(plugin.resolveId('@salesforce/label/someLabel')).toEqual(
                    '@salesforce/label/someLabel.js'
                );
            });
        });

        describe('load()', () => {
            it('Returns null for non @salesforce/label scoped values', async () => {
                const Service = getLabelService(CUSTOM_LABELS_PATH);
                const labelsService = new Service();
                await labelsService.initialize();
                const plugin = labelsService.getPlugin({});

                expect(
                    // @ts-ignore
                    plugin.load('c.nathan_name.js')
                ).toBeNull();
            });

            it('Returns the label as a default module when it exists', async () => {
                const Service = getLabelService(CUSTOM_LABELS_PATH);
                const labelsService = new Service();
                await labelsService.initialize();
                const plugin = labelsService.getPlugin({});

                expect(
                    // @ts-ignore
                    plugin.load('@salesforce/label/c.nathan_name.js')
                ).toEqual('export default "Nathan McWilliams"');
            });

            it('Returns the label as a default stub with the key when it does not exist.', async () => {
                const Service = getLabelService(CUSTOM_LABELS_PATH);
                const labelsService = new Service();
                await labelsService.initialize();
                const plugin = labelsService.getPlugin({});

                expect(
                    // @ts-ignore
                    plugin.load('@salesforce/label/c.nonexist_name.js')
                ).toEqual('export default "[c.nonexist_name]"');
            });

            it('Does not return native members', async () => {
                const Service = getLabelService(CUSTOM_LABELS_PATH);
                const labelsService = new Service();
                await labelsService.initialize();
                const plugin = labelsService.getPlugin({});

                expect(
                    // @ts-ignore
                    plugin.load('@salesforce/label/c.toString.js')
                ).toEqual('export default "[c.toString]"');
            });
        });
    });
});

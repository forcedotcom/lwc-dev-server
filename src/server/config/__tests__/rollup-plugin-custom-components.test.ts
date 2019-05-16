import { customComponentPlugin } from '../rollup-plugin-custom-components';

import glob from 'fast-glob';

jest.mock('fast-glob', () => {
    return {
        sync: jest.fn(() => [])
    };
});

describe('customComponentPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('resolveId', () => {
        it('loading a custom component returns mapped location', () => {
            let globPath: string = '';
            let globOptions: { cwd: string } = { cwd: '' };
            // @ts-ignore
            glob.sync.mockImplementationOnce(
                (path: string, options: { cwd: string }) => {
                    globPath = path;
                    globOptions = options;
                    return ['/src/random/folders/mappedNamespace/name/name.js'];
                }
            );
            const mapped = customComponentPlugin(
                'namespace',
                'mappedNamespace',
                '/src'
            ).resolveId('namespace/name');

            expect(mapped).toBe(
                '/src/random/folders/mappedNamespace/name/name.js'
            );
            expect(glob.sync).toHaveBeenCalledTimes(1);
            expect(globPath).toBe('**/mappedNamespace/name/name.*');
            expect(globOptions.cwd).toBe('/src');
        });

        it('loading a custom component returns mapped location for bundle pieces', () => {
            // @ts-ignore
            glob.sync.mockImplementationOnce(() => [
                '/src/random/folders/mappedNamespace/name/name.js',
                '/src/random/folders/mappedNamespace/name/name.html',
                '/src/random/folders/mappedNamespace/name/name.js-meta.xml',
                '/src/random/folders/mappedNamespace/name/name.css'
            ]);
            const plugin = customComponentPlugin(
                'namespace',
                'mappedNamespace',
                '/src'
            );

            plugin.resolveId('namespace/name');
            const mappedHtml = plugin.resolveId('./name.html');
            const mappedCss = plugin.resolveId('./name.css');
            const mappedMeta = plugin.resolveId('./name.js-meta.xml');

            expect(mappedHtml).toBe(
                '/src/random/folders/mappedNamespace/name/name.html'
            );
            expect(mappedCss).toBe(
                '/src/random/folders/mappedNamespace/name/name.css'
            );
            expect(mappedMeta).toBe(
                '/src/random/folders/mappedNamespace/name/name.js-meta.xml'
            );
        });

        it('none matched namespace returns null', () => {
            const result = customComponentPlugin('n', 'mn', '/src').resolveId(
                'b/name'
            );
            expect(result).toBeNull();
        });
    });
});

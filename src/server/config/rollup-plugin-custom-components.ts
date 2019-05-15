import path from 'path';
import glob from 'fast-glob';
import fs from 'fs-extra';
import { EntryItem } from 'fast-glob/out/types/entries';
const compiler = require('@lwc/compiler');
import CompilerOptions from '@lwc/compiler/dist/types/compiler/options';

const debug = require('debug')('localdevserver');

function isInNamespace(id: string, namespace: string) {
    return (
        id.startsWith(`${namespace}/`) || id.indexOf(`/${namespace}/`) !== -1
    );
}

/**
 * Rollup plugin that resolves custom components
 *
 * @param namespace the namespace that will be requested
 * @param fileSystemNamespace the namespace that exists on the file system
 * @param srcDir the folder that will contain the components
 */
export function customComponentPlugin(
    namespace: string,
    fileSystemNamespace: string,
    srcDir: string
) {
    const mappings: { [key: string]: string } = {};
    return {
        name: 'rollup-plugin-custom-components',

        /**
         * Check the "id" to see if it's a custom component ("c" namespace).
         * If so, return the path to the actual resource, adding a mapping to other parts of the module
         * @param id - the module (or other resource)
         */
        resolveId(id: string) {
            debug(
                `[CustomComponent rollup plugin] resolveId called with ${id}`
            );
            if (isInNamespace(id, namespace)) {
                const componentName = path.basename(id);
                let jsFileName: string | null = null;
                const files = glob
                    .sync(
                        `**/${fileSystemNamespace}/${componentName}/${componentName}.*`,
                        {
                            cwd: srcDir,
                            absolute: true,
                            ignore: ['**/__tests__/**']
                        }
                    )
                    .forEach(
                        (
                            value: EntryItem,
                            _index: number,
                            _array: EntryItem[]
                        ) => {
                            let extension = path.extname(<string>value);
                            if (extension === '.js') {
                                jsFileName = value.toString();
                            }
                            mappings[
                                `./${path.basename(value.toString())}`
                            ] = value.toString();
                        }
                    );
                debug(
                    `[CustomComponent rollup plugin] resolving as ${jsFileName}`
                );
                return jsFileName;
            }
            if (mappings[id]) {
                debug(
                    `[CustomComponent rollup plugin] resolving as mapped ${
                        mappings[id]
                    }`
                );
                return mappings[id];
            }

            return null;
        }
    };
}

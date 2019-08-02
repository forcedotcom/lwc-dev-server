const LABEL_PREFIX = '@salesforce/label/';
import { Plugin } from 'rollup';
import fs from 'fs-extra';

export function labelsPlugin(labels: any): Plugin {
    return {
        name: 'rollup-plugin-oss-labels',

        load(id) {
            if (id.startsWith(LABEL_PREFIX)) {
                const label = labels[id];
                if (label) {
                    return fs.readFile(label.entry, 'utf8');
                }
            }
            return null;
        },

        resolveId(id) {
            if (id.startsWith(LABEL_PREFIX)) {
                return id;
            }
            return null;
        }
    };
}

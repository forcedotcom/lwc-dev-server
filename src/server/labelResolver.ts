import fs from 'fs-extra';
import parser from 'fast-xml-parser';
import debugLogger from 'debug';

const debug = debugLogger('localdevserver');

/**
 * Contains a map of namespaces/sections to label key-value pairs.
 */
interface LabelMap {
    [namespace: string]: LabelValues;
}

/**
 * Contains a map of label keys to label values.
 */
interface LabelValues {
    [name: string]: string;
}

/**
 * Resolves label values for `@salesforce/label` imports.
 */
interface LabelResolver {
    /**
     * Creates an object representing the labels data.
     *
     * The object is mapped from label namespace to the corresponding label
     * key-value pairs. Custom labels are under the `c` namespace.
     *
     * This proxy will return a placeholder value for label keys that do not
     * exist.
     */
    createProxiedObject(): LabelMap;
}

/**
 * Options for creating the labels resolver.
 */
interface LabelResolverOptions {
    /**
     * Absolute path to the custom labels xml file, usually named
     * `CustomLabels.labels-meta.xml`.
     */
    customLabelsPath?: string;
}

/**
 * Returns a label resolver for the given label sources.
 */
// TODO this could be faster if we watch for changes to label files
// and update object instead of proxy + loading labels every time.
export default function resolver(
    options: LabelResolverOptions = {}
): LabelResolver {
    const { customLabelsPath } = options;
    if (customLabelsPath && !fs.existsSync(customLabelsPath)) {
        throw new Error(`labels file '${customLabelsPath}' does not exist`);
    }

    return {
        createProxiedObject(): LabelMap {
            const customLabelsProxy = new Proxy(
                {},
                {
                    get(obj, prop) {
                        debug(`get: ${String(prop)}`);
                        if (typeof prop === 'string') {
                            const labels = loadCustomLabels(customLabelsPath);
                            if (prop in labels) {
                                return labels[prop];
                            }
                            return `{unknown label: c.${prop}}`;
                        }
                    }
                }
            );

            return {
                c: customLabelsProxy
            };
        }
    };
}

function loadCustomLabels(labelsPath: string | undefined): LabelValues {
    debug('loading custom labels');

    if (!labelsPath || !fs.existsSync(labelsPath)) {
        debug('custom labels file not specified or does not exist');
        return {};
    }

    const xmlContent = fs.readFileSync(labelsPath, 'utf8');
    const parsedXml = parser.parse(xmlContent);

    if (!parsedXml.CustomLabels || !parsedXml.CustomLabels.labels) {
        console.warn(
            `custom labels file '${labelsPath}' did not have expected format or was empty, ignoring.`
        );
        return {};
    }

    let labels = parsedXml.CustomLabels.labels;
    if (!Array.isArray(labels)) {
        labels = [labels];
    }

    const processed = labels.reduce((obj: LabelValues, label: any) => {
        if (label.fullName && label.value) {
            obj[label.fullName] = label.value;
        }
        return obj;
    }, {});

    debug(`found custom labels: ${JSON.stringify(processed, null, 2)}`);
    return processed;
}

import fs from 'fs-extra';
import parser from 'fast-xml-parser';
import debugLogger from 'debug';

const debug = debugLogger('localdevserver:labelsresolver');

/**
 * Contains a map of namespaces/sections to label data.
 */
interface LabelNamespaces {
    [namespace: string]: LabelValues;
}

/**
 * Contains a map of label keys to label values.
 */
interface LabelValues {
    [name: string]: string;
}

/**
 * Resolves labels from the local files.
 */
interface LabelsResolver {
    /**
     * Creates an object representing the labels data.
     *
     * The object is mapped from label namespace to the corresponding label
     * key-value pairs. Custom labels are under the `c` namespace.
     *
     * This proxy will return a placeholder value for any label keys that do not
     * exist.
     */
    createProxiedObject(): Promise<LabelNamespaces>;
}

/**
 * Options for creating the labels resolver.
 */
interface LabelsResolverOptions {
    /**
     * Absolute path to the custom labels xml file, usually named
     * `CustomLabels.labels-meta.xml`.
     */
    customLabelsPath?: string;
}

/**
 * Creates a new labels resolver for the given labels.
 */
// TODO this could be faster if we watch for changes to label files
// and update object instead of loading labels every time and using a proxy.
export default async function resolver(
    options: LabelsResolverOptions
): Promise<LabelsResolver> {
    const { customLabelsPath } = options;
    if (customLabelsPath && !fs.existsSync(customLabelsPath)) {
        throw new Error(`labels file '${customLabelsPath}' doesn't exist`);
    }

    return {
        async createProxiedObject(): Promise<LabelNamespaces> {
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

    if (!labelsPath) {
        debug('custom labels file not specified');
        return {};
    }

    const xmlContent = fs.readFileSync(labelsPath, 'utf8');
    const parsedXml = parser.parse(xmlContent);

    if (!parsedXml.CustomLabels || !parsedXml.CustomLabels.labels) {
        console.warn(
            `custom labels file '${labelsPath}' did not have expected format, ignoring.`
        );
        return {};
    }

    const labels = parsedXml.CustomLabels.labels;
    const processed = labels.reduce((obj: LabelValues, label: any) => {
        obj[label.fullName] = label.value;
        return obj;
    }, {});

    debug(`found custom labels: ${JSON.stringify(processed, null, 2)}`);

    return processed;
}

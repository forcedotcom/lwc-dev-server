import fs from 'fs-extra';
import parser from 'fast-xml-parser';
import debugLogger from 'debug';

import {
    AddressableService,
    RequestService,
    ContainerContext,
    RequestParams,
    RequestOutput,
    RequestOutputTypes,
    CompileService,
    PublicConfig,
    ComponentResource
} from '@webruntime/api';
import { compile, RuntimeCompilerOutput } from '@webruntime/compiler';
import { watch } from 'chokidar';
import { DiagnosticLevel } from '@lwc/errors';
import { CompilerResourceMetadata } from 'common/CompilerResourceMetadata';

const NAMESPACE = '@salesforce/label/';
const URI = '@salesforce/label/:labelId';
const debug = debugLogger('localdevserver');

/**
 * Contains a map of label keys to label values.
 */
interface LabelValues {
    [name: string]: string;
}

export function getLabelService(
    customLabelsPath: string
): new (config: PublicConfig) => AddressableService & RequestService {
    return class LabelService extends AddressableService
        implements RequestService {
        private labels: { [key: string]: string | { [key: string]: string } };
        private moduleCache: Map<string, RuntimeCompilerOutput>;

        constructor() {
            super(URI);
            this.labels = {};

            // A cache of compiled labels.
            this.moduleCache = new Map();
        }

        async initialize() {
            this.labels = this.loadCustomLabels(customLabelsPath);

            // Watch for changes in the labels directory.
            // Upon change, clear the cache and re-read the files.
            watch(customLabelsPath).on('change', () => {
                this.moduleCache.clear();
                this.labels = this.loadCustomLabels(customLabelsPath);
            });
        }

        /**
         * Convert from URI of /salesforce/labels/:labelId to
         * import scope address @salesforce/label/:labelId
         *
         * @param url
         */
        toSpecifier(url: string) {
            const { labelId } = this.parseUrl(url);
            return `@salesforce/label/${labelId}`;
        }

        /**
         * Everything under @salesforce/label is handled by this service.
         */
        get mappings() {
            return {
                '@salesforce/label/': '/salesforce/labels/:labelId'
            };
        }

        private loadCustomLabels(labelsPath: string | undefined): LabelValues {
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

        /**
         * Find the correct language to pull labels from.
         *
         * @param {string} locale
         */
        private getLabelsForLocale(locale = 'en'): { [key: string]: string } {
            // Try:
            //  - the full locale
            //  - language part of the locale, with country removed
            //  - "en"
            return (this.labels[locale] ||
                this.labels[locale.substring(0, 2)] ||
                this.labels.en ||
                {}) as { [key: string]: string };
        }

        /**
         * Given a label specifier, compile the code needed to provide it.
         *
         * @param {string} specifier - The label specifier to compile
         * @param {object} pivots - Pivots for the label, eg: mode, locale
         * @param {object} compilerContext - Compiler config from webruntime-app.config.js
         */
        async compileLabel(
            specifier: string,
            params: RequestParams,
            context: ContainerContext
        ): Promise<RuntimeCompilerOutput | undefined> {
            const { mode, locale } = params;
            const [section, name] = specifier.split('.');
            const namespace = `${NAMESPACE}${section}`;
            const descriptor = `${mode}/${namespace}/${name}@${locale}`;

            const labels:
                | string
                | { [key: string]: string } = this.getLabelsForLocale(
                params.locale
            );
            let moduleDef = this.moduleCache.get(descriptor);
            if (!moduleDef) {
                const label: string | { [key: string]: string } =
                    labels[specifier];
                if (label) {
                    const files = {
                        [`${namespace}/${name}.js`]: `export default "${label}"`
                    };
                    moduleDef = await compile({
                        ...context,
                        name,
                        namespace,
                        files
                    });

                    if (moduleDef) {
                        this.moduleCache.set(`${descriptor}`, moduleDef);
                    }
                }
            }

            return moduleDef;
        }

        /**
         * Implement a RequestService, which exposes modules to be built by the Container.
         *
         * @param {string} specifier
         * @param {object} pivots = { mode, locale }
         * @param {object} compilerConfig
         *
         * @example
         * @salesforce/label                -- all labels for the locale
         * @salesforce/label/section        -- a section of labels for a locale
         * @salesforce/label/section.name   -- a single label for a locale
         */
        async request(
            specifier: string,
            params: RequestParams,
            context: ContainerContext
        ): Promise<RequestOutput> {
            // A locale is required.
            const locale = params.locale || 'en';
            if (!locale) {
                return {
                    type: RequestOutputTypes.COMPONENT,
                    specifier,
                    success: false,
                    diagnostics: [
                        {
                            code: -1,
                            message: 'A locale is required to fetch a label',
                            level: DiagnosticLevel.Fatal
                        }
                    ]
                };
            }

            // Parse the specifier for label information.
            const parts = specifier.split('/');
            const section = parts[2];
            const name = parts[3];
            const ids = [];
            const labels = this.getLabelsForLocale(locale);

            if ((!name || name === '') && section === '') {
                // All labels
                ids.push(...Object.keys(labels));
            } else {
                if (section && !name) {
                    // All labels in a section
                    ids.push(
                        ...Object.keys(labels).filter(label =>
                            label.startsWith(section)
                        )
                    );
                } else {
                    // A specific label
                    ids.push(`${section}.${name}`);
                }
            }

            // Compile and list all requested label IDs.
            const resources = [];
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const compilerOutput:
                    | RuntimeCompilerOutput
                    | undefined = await this.compileLabel(id, params, context);

                if (!compilerOutput) {
                    debugLogger(`Attempting to load label ${id} failed.`);
                    continue;
                }

                /* eslint-disable-next-line no-await-in-loop */
                const {
                    result,
                    metadata,
                    success,
                    diagnostics
                } = compilerOutput;
                if (result) {
                    resources.push({
                        type: RequestOutputTypes.COMPONENT as RequestOutputTypes.COMPONENT,
                        specifier: `${NAMESPACE}${section}/${name}`,
                        resource: result,
                        metadata: new CompilerResourceMetadata(metadata),
                        success,
                        diagnostics
                    });
                }
            }

            return resources[0];
        }

        // async request(
        //     specifier: string,
        //     params: RequestParams,
        //     context: ContainerContext
        // ): Promise<RequestOutput> {
        //     const { compilerConfig }: { compilerConfig?: any } = context;
        //     //const { namespace, name } = getNameNamespaceFromSpecifier(specifier);
        //     const namespace = 'c';
        //     const name = 'name';
        //     const label = this.labels.hasOwnProperty(name)
        //         ? this.labels[name]
        //         : `[${namespace}.${name}]`;

        //     const files: { [key: string]: string } = {};
        //     files[`${specifier}.js`] = `export default "${label}"`;

        //     const { result, success, diagnostics, metadata } = await compile({
        //         ...compilerConfig,
        //         name,
        //         namespace,
        //         files
        //     });

        //     return {
        //         type: RequestOutputTypes.COMPONENT,
        //         specifier,
        //         resource: result,
        //         success,
        //         metadata,
        //         diagnostics
        //     };
        // }

        // getPlugin(pivots = {}) {
        //     return {
        //         name: 'labels-addressable-service',

        //         resolveId(specifier: string) {
        //             return null;
        //         },
        //         load(specifier: string) {
        //             return null;
        //         }
        //     };
        // }
    };
}

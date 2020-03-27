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
import { CompilerResourceMetadata } from '../../common/CompilerResourceMetadata';

const NAMESPACE = '@salesforce/label';
const URI_PREFIX = `/label/:mode/:locale/:name`;
const PACKAGE_MAPPING = `${NAMESPACE}/`;

const debug = debugLogger('localdevserver:labelsservice');

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
        private labels: { [key: string]: string };
        private moduleCache: Map<string, RuntimeCompilerOutput>;

        /**
         * Everything under @salesforce/label is handled by this service.
         */
        readonly mappings: { [key: string]: string };

        constructor() {
            super(URI_PREFIX);
            this.labels = {};

            this.mappings = {
                [NAMESPACE]: URI_PREFIX
            };

            debug(this.mappings);

            // A cache of compiled labels.
            this.moduleCache = new Map();
        }

        async initialize() {
            debug('labels initialize()');

            // Handle error on no labels file found.
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
            const { name } = this.parseUrl(url);

            debug(`labels toSpecifier(${url}) - ${NAMESPACE}/${name}`);
            return `${NAMESPACE}/${name}`;
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
                    obj['c.' + label.fullName] = label.value;
                }
                return obj;
            }, {});

            debug(`found custom labels: ${JSON.stringify(processed, null, 2)}`);
            return processed;
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
            debug(`compile label: ${specifier}`);
            const { mode, locale } = params;
            const descriptor = `${mode}/${NAMESPACE}/${specifier}@${locale}`;

            let moduleDef = this.moduleCache.get(descriptor);
            if (!moduleDef) {
                debug(
                    `No cached module for label ${specifier}. Compiling now.`
                );
                const label: string = this.labels[specifier];
                if (label) {
                    const files = {
                        [`${NAMESPACE}/${specifier}.js`]: `export default "${label}"`
                    };
                    moduleDef = await compile({
                        ...context,
                        name: specifier,
                        namespace: NAMESPACE,
                        files
                    });

                    if (moduleDef && moduleDef.success) {
                        this.moduleCache.set(`${descriptor}`, moduleDef);
                        debug(`Compiling label ${specifier} succeeded.`);
                    } else {
                        debug(`Compiling label ${specifier} failed.`);
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
                debug('No locale detected, exiting');
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
            const id = parts[2];

            const compilerOutput:
                | RuntimeCompilerOutput
                | undefined = await this.compileLabel(id, params, context);

            if (!compilerOutput) {
                debug(`Attempting to load label ${id} failed.`);
                return {
                    type: RequestOutputTypes.COMPONENT,
                    specifier,
                    success: false,
                    diagnostics: [
                        {
                            code: -1,
                            message: 'Compiler output undefined or null',
                            level: DiagnosticLevel.Fatal
                        }
                    ]
                };
            }

            const { result, metadata, success, diagnostics } = compilerOutput;
            return {
                type: RequestOutputTypes.COMPONENT as RequestOutputTypes.COMPONENT,
                specifier,
                resource: result,
                metadata: new CompilerResourceMetadata(metadata),
                success,
                diagnostics
            };
        }

        getPlugin(pivots = {}) {
            const labels = this.labels;
            return {
                name: 'labels-addressable-service',

                resolveId(specifier: string) {
                    if (specifier.startsWith(PACKAGE_MAPPING)) {
                        return `${specifier}.js`;
                    }
                    return null;
                },
                load(specifier: string) {
                    if (specifier.startsWith(PACKAGE_MAPPING)) {
                        const key = specifier
                            .replace(PACKAGE_MAPPING, '')
                            .replace('.js', '')
                            .replace('/', '.');
                        if (labels.hasOwnProperty(key)) {
                            return `export default "${labels[key]}"`;
                        }
                        return `export default "[${key}]"`;
                    }
                    return null;
                }
            };
        }
    };
}

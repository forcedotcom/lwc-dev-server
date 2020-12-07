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
    PublicConfig,
    CompileService,
    ImportMapObject
} from '@webruntime/api';
import {
    compile,
    RuntimeCompilerOutput,
    LoadingCache
} from '@webruntime/compiler';
import { watch, FSWatcher } from 'chokidar';
import { DiagnosticLevel } from '@lwc/errors';
// import { resolveModules } from '@lwc/module-resolver';

/**
 * Contains a map of label keys to label values.
 */
export interface LabelValues {
    [name: string]: string;
}

const NAMESPACE = '@salesforce/label';
const URI_PREFIX = `/label/:mode/:locale/:name`;
const PACKAGE_MAPPING = `${NAMESPACE}/`;

const debug = debugLogger('localdevserver:labelsservice');

export function getLabelService(
    customLabelsPath?: string
): new (config?: PublicConfig) => AddressableService &
    RequestService &
    CompileService {
    return class LabelService extends AddressableService
        implements RequestService {
        private customLabels: LabelValues;
        private moduleLabels: LabelValues;
        private moduleCache: Map<string, RuntimeCompilerOutput>;
        private moduleLabelsCache: LoadingCache;
        private watcher: FSWatcher | undefined;

        /**
         * Everything under @salesforce/label is handled by this service.
         */
        readonly mappings: ImportMapObject<string>;
        private readonly publicConfig: PublicConfig | undefined;

        constructor(publicConfig?: PublicConfig) {
            super(URI_PREFIX);
            this.customLabels = {};
            this.moduleLabels = {};

            this.mappings = {
                [NAMESPACE]: URI_PREFIX
            };

            // A cache of compiled labels.
            this.moduleCache = new Map();
            this.publicConfig = publicConfig;
            this.moduleLabelsCache = new LoadingCache(
                this.loadModuleLabel.bind(this)
            );
        }

        async initialize() {
            // Handle error on no labels file found.
            this.customLabels = this.loadCustomLabels(customLabelsPath);
            this.moduleLabels = await this.loadModuleLabels();

            if (customLabelsPath) {
                // Watch for changes in the labels directory.
                // Upon change, clear the cache and re-read the files.
                this.watcher = watch(customLabelsPath).on('change', () => {
                    this.moduleCache.clear();
                    this.customLabels = this.loadCustomLabels(customLabelsPath);
                });
            }

            debug('Labels loaded', this.customLabels);
        }

        async shutdown() {
            if (this.watcher) {
                await this.watcher.close();
            }
        }

        /**
         * Convert from URI of /salesforce/label/:labelId to
         * import scope address @salesforce/label/:labelId
         *
         * @param url
         */
        toSpecifier(url: string) {
            const { name } = this.parseUrl(url);
            return `${NAMESPACE}/${name}`;
        }

        private loadCustomLabels(labelsPath: string | undefined): LabelValues {
            if (!labelsPath) {
                debug('custom labels file not specified');
                return {};
            }
            if (!fs.existsSync(labelsPath)) {
                console.warn(
                    `Warning: Labels file '${labelsPath}' does not exist.`
                );
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

        private resolveAllModules(
            projectDir: string | undefined,
            moduleDir: string | undefined,
            customModuleDirs: string[] = []
        ) {
            if (projectDir === undefined) {
                return [];
            }
            return [];
            // return resolveModules({
            //     rootDir: projectDir,
            //     modules: moduleDir
            //         ? [moduleDir, ...customModuleDirs]
            //         : customModuleDirs
            // });
        }

        private async loadModuleLabels(): Promise<LabelValues> {
            if (!this.publicConfig) {
                return {};
            }

            // Get all the label dependencies for the project
            // specified in the configuration files
            // uses @lwc/module-resolver
            const lwcOptions = this.publicConfig.compilerConfig.lwcOptions || {
                modules: []
            };
            const modules = this.resolveAllModules(
                this.publicConfig.projectDir,
                this.publicConfig.moduleDir,
                lwcOptions.modules
            );

            const labelResolutions: LabelValues = {};
            modules.forEach((mapping: any) => {
                if (mapping.specifier.startsWith(PACKAGE_MAPPING)) {
                    labelResolutions[specifierToCacheKey(mapping.specifier)] =
                        mapping.entry;
                }
            });

            return labelResolutions;
        }

        /**
         * Used by LoadingCache to load the contents
         * of a label from the file system when it is needed.
         *
         * File based dependencies do not change and are not watched
         * so memoizing them for the length of the session is acceptable.
         *
         * @param specifier label import reference. @salesforce/label/Lightning.MyLabel
         */
        private loadModuleLabel(specifier: string): string {
            return fs.readFileSync(
                this.moduleLabels[specifierToCacheKey(specifier)],
                'utf-8'
            );
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
                const label: string = this.customLabels[specifier];
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
         * /salesforce/label/section.name   -- a single label for a locale
         */
        async request(
            specifier: string,
            params: RequestParams,
            context: ContainerContext
        ): Promise<RequestOutput> {
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
                type: RequestOutputTypes.COMPONENT,
                specifier,
                resource: result,
                metadata,
                success,
                diagnostics
            };
        }

        getPlugin() {
            const customlabels = this.customLabels;
            const moduleLabels = this.moduleLabels;
            const moduleLabelsCache = this.moduleLabelsCache;
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
                        const key = specifierToCacheKey(specifier);

                        if (moduleLabels.hasOwnProperty(key)) {
                            return moduleLabelsCache.get(key) as string;
                        }

                        // We do not want to use the moduleLabelsCache since
                        // that is cached for the length of the session
                        // and custom label changes would not get reloaded.
                        if (customlabels.hasOwnProperty(key)) {
                            return `export default "${customlabels[key]}"`;
                        }
                        return `export default "[${key}]"`;
                    }
                    return null;
                }
            };
        }
    };
}

function specifierToCacheKey(specifier: string) {
    return specifier
        .replace(PACKAGE_MAPPING, '')
        .replace('.js', '')
        .replace('/', '.');
}

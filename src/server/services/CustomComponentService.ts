import path from 'path';
import debugLogger from 'debug';
import { resolveModules } from '@lwc/module-resolver';
import { compile } from '@webruntime/compiler';
import {
    AddressableService,
    ContainerContext,
    PublicConfig,
    RequestOutput,
    RequestOutputTypes,
    RequestParams,
    RequestService
} from '@webruntime/api';

const SFDX_LWC_DIRECTORY = 'lwc';

const URI_PREFIX = `/custom-component`;
const URI = `${URI_PREFIX}/:uid/:mode/:locale/:namespace/:name`;

const debug = debugLogger('localdevserver:customcomponents');

/**
 * Returns a Service which will resolve custom components from an SFDX project.
 *
 * In SFDX projects, the custom components live in a directory (`lwc`) that
 * differs from the namespace referenced in code (usually `c`). This maps
 * references to that namespace to the actual directory the compiler expects.
 *
 * @param customModulesNamespace The custom components namespace, e.g., `c`.
 * @param modulesDirectory Absolute path to the parent of the 'lwc' directory.
 */
export function getCustomComponentService(
    customModulesNamespace: string,
    modulesDirectory: string
): new (config: PublicConfig) => AddressableService & RequestService {
    // TODO we can probably simplify this by extending LWR's ComponentService
    return class CustomComponentService extends AddressableService
        implements RequestService {
        constructor(config: PublicConfig) {
            super(URI);
        }

        get mappings() {
            const modules = this.resolveCustomModules();
            debug(`found modules: ${JSON.stringify(modules, null, 2)}`);

            const mappings: { [key: string]: any } = {};
            for (const mapping of modules) {
                const { specifier } = mapping;
                if (specifier) {
                    const name = this.extractNameFromSpecifier(specifier);
                    if (!name) {
                        throw new Error(
                            `Invalid specifier for custom component: ${specifier}`
                        );
                    }
                    const key = `${customModulesNamespace}/${name}`;
                    mappings[key] = `${URI_PREFIX}/:uid/:mode/:locale/${key}`;
                }
            }
            debug(`mappings: ${JSON.stringify(mappings, null, 2)}`);
            return mappings;
        }

        toSpecifier(url: string): string {
            const { namespace, name } = this.parseUrl(url);
            return `${namespace}/${name}`;
        }

        async initialize() {}

        async request(
            specifier: string,
            params: RequestParams,
            { compilerConfig }: ContainerContext
        ): Promise<RequestOutput> {
            const name = this.extractNameFromSpecifier(specifier);
            if (!name) {
                throw new Error(
                    `Invalid specifier for custom component: ${specifier}`
                );
            }

            compilerConfig.baseDir = modulesDirectory;

            const { result, metadata, success, diagnostics } = await compile({
                ...compilerConfig,
                namespace: SFDX_LWC_DIRECTORY,
                name
            });

            return {
                type: RequestOutputTypes.COMPONENT,
                specifier,
                resource: result,
                metadata,
                success,
                diagnostics
            };
        }

        private resolveCustomModules() {
            const lwcModulesDirectory = path.join(
                modulesDirectory,
                SFDX_LWC_DIRECTORY
            );

            const customModules = resolveModules({
                modules: [modulesDirectory]
            }).filter(mapping => mapping.entry.startsWith(lwcModulesDirectory));

            return customModules;
        }

        private extractNameFromSpecifier(specifier: string) {
            const split = specifier.split('/');
            if (!split || split.length !== 2) {
                return null;
            }
            return split[1];
        }
    };
}

import path from 'path';
import debugLogger from 'debug';
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
import { CompilerResourceMetadata } from 'common/CompilerResourceMetadata';

const SFDX_LWC_DIRECTORY = 'lwc';

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
    const uriPrefix = `/custom-component/:uid/:mode/:locale/${customModulesNamespace}/`;
    const uri = `${uriPrefix}:name`;

    return class extends AddressableService implements RequestService {
        mappings: { [key: string]: any } = {};

        constructor(config: PublicConfig) {
            super(uri);

            this.mappings = {
                [`${customModulesNamespace}/`]: uriPrefix
            };
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
                metadata: new CompilerResourceMetadata(metadata),
                success,
                diagnostics
            };
        }

        toSpecifier(url: string): string {
            const namespace = path.basename(path.dirname(url));
            const name = path.basename(url);
            return `${namespace}/${name}`;
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

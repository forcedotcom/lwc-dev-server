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
    RequestService,
    ImportMapObject
} from '@webruntime/api';
import { CompilerDiagnostic } from '@lwc/errors';
import stripAnsi from 'strip-ansi';
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

    return class CustomComponentService extends AddressableService
        implements RequestService {
        mappings: ImportMapObject<string> = {};

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

            let { result, metadata, success, diagnostics } = await compile({
                ...compilerConfig,
                namespace: SFDX_LWC_DIRECTORY,
                name
            });

            if (diagnostics && diagnostics.length > 0) {
                let partialCompileError = false;
                // Components that require multiple dependencies are compiled
                // multiple times in order to address all the dependencies.
                // When an internal dependency is missing it will return a diagnostics
                // with code 1002, we need to let does be taken care of by the compiler
                // and not immediately surface them to the user
                for (let i = 0; i < diagnostics.length; i++) {
                    if (diagnostics[i].code === 1002) {
                        partialCompileError = true;
                        break;
                    }
                }

                if (!partialCompileError) {
                    return {
                        type: RequestOutputTypes.JSON,
                        resource: { json: this.formatDiagnostics(diagnostics) },
                        specifier,
                        diagnostics,
                        success
                    };
                }
            }

            return {
                type: RequestOutputTypes.COMPONENT,
                specifier,
                resource: result,
                metadata,
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

        // Clean up Diagnostics since they are provided in a format suitable for the command line
        // but not for being displayed by the app's error component
        private formatDiagnostics(diagnostics: CompilerDiagnostic[]) {
            let resultJSON = { errors: [] };
            diagnostics.forEach(diagnostic => {
                let msgTitle = diagnostic.message.split('\n')[0];
                const msgBody = stripAnsi(
                    diagnostic.message.replace(msgTitle, '')
                );
                if (diagnostic.filename) {
                    msgTitle = msgTitle.replace(`${diagnostic.filename}:`, '');
                }

                const err = {
                    filename: diagnostic.filename,
                    location: diagnostic.location,
                    code: msgBody,
                    message: msgTitle
                };
                // @ts-ignore
                resultJSON.errors.push(err);
            });
            return resultJSON;
        }
    };
}

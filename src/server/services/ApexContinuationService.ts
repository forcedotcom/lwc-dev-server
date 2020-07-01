import { CompileService } from '@webruntime/api';

const APEX_CONTINUATION_REGEX = /^(@salesforce\/apexContinuation)(?:\/([\w-]+\.[\w-]+(?:\.[\w-]+)?))?$/;

function matchesApexContinuationScopedModule(id: string) {
    return id && id.match(APEX_CONTINUATION_REGEX);
}

/**
 * Rollup plugin to resolve @salesforce/apexContinuation
 *
 */
function plugin() {
    return {
        name: 'rollup-plugin-apex-continuation',

        resolveId(id: string) {
            return matchesApexContinuationScopedModule(id) ? id : null;
        },
        load(id: any) {
            const idParts = matchesApexContinuationScopedModule(id);
            if (idParts) {
                throw new Error(
                    'Preview of component using Apex Continuation is not supported'
                );
            }
            return null;
        }
    };
}

export class ApexContinuationService implements CompileService {
    getPlugin() {
        return plugin();
    }

    async initialize() {}

    shutdown() {}
}

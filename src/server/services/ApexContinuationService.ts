import { CompileService, PublicConfig } from '@webruntime/api';
import debugLogger from 'debug';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from '../Constants';

const APEX_CONTINUATION_REGEX = /^(@salesforce\/apexContinuation)(?:\/([\w-]+\.[\w-]+(?:\.[\w-]+)?))?$/;
const debug = debugLogger('localdevserver:resource');

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

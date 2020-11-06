import { CompileService } from '@webruntime/api';
import path from 'path';

const APEX_LWC_MESSAGE_SERVICE_REGEX = /^(@salesforce\/messageChannel\/.*)/;

function matchesLWCMessageServiceScopedModule(id: string) {
    return id && id.match(APEX_LWC_MESSAGE_SERVICE_REGEX);
}

/**
 * Rollup plugin to resolve @salesforce/messageChannel
 *
 */
function plugin() {
    return {
        name: 'rollup-plugin-lwc-message-service',

        resolveId(id: string) {
            return matchesLWCMessageServiceScopedModule(id) ? id : null;
        },
        load(id: any) {
            const idParts = matchesLWCMessageServiceScopedModule(id);
            if (idParts) {
                throw new Error(
                    "You can't preview a component using Lightning Message Service. Test the component directly in the org"
                );
            }
            return null;
        }
    };
}

export class LWCMessageService implements CompileService {
    getPlugin() {
        return plugin();
    }

    async initialize() {}

    shutdown() {}
}

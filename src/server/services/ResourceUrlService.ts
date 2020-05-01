import { CompileService, PublicConfig } from '@webruntime/api';
import debugLogger from 'debug';

const RESOURCE_URL_PREFIX = '@salesforce/resourceUrl/';
const debug = debugLogger('localdevserver:resource');

function isResourceUrlScopedModule(id: string) {
    return id && id.startsWith(RESOURCE_URL_PREFIX);
}

/**
 * Rollup plugin to resolve @salesforce/resourceUrl imports.
 */
function plugin(basePath: string) {
    return {
        name: 'rollup-plugin-salesforce-resource-urls',

        load(id: string) {
            if (isResourceUrlScopedModule(id)) {
                const versionKey = '1'; // TODO: read from lib
                const resourceName = id.substring(RESOURCE_URL_PREFIX.length);
                const replacement = `/assets/project/${versionKey}/${resourceName}`;

                debug(`resolving ${id} as ${replacement}`);
                return `export default \`${replacement}\`;`;
            }

            return null;
        },

        resolveId(id: string) {
            return isResourceUrlScopedModule(id) ? id : null;
        }
    };
}

/**
 * Handles compiling @salesforce/resourceUrl imports.
 */
export class ResourceUrlService implements CompileService {
    readonly basePath: string;

    constructor({ server: { basePath = '' } }: PublicConfig) {
        this.basePath = basePath;
    }

    getPlugin() {
        return plugin(this.basePath);
    }

    async initialize() {}

    shutdown() {}
}

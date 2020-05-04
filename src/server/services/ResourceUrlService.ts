import { CompileService, PublicConfig } from '@webruntime/api';
import debugLogger from 'debug';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';

const RESOURCE_URL_PREFIX = '@salesforce/resourceUrl/';
const debug = debugLogger('localdevserver:resource');

function isResourceUrlScopedModule(id: string) {
    return id && id.startsWith(RESOURCE_URL_PREFIX);
}

/**
 * Rollup plugin to resolve @salesforce/resourceUrl imports.
 *
 * @param buildDir Absolute path to the webruntime output directory.
 */
function plugin(buildDir: string) {
    return {
        name: 'rollup-plugin-salesforce-resource-urls',

        load(id: string) {
            if (isResourceUrlScopedModule(id)) {
                const versionKey = getLatestVersion(buildDir);
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

export class ResourceUrlService implements CompileService {
    buildDir: string;

    constructor({ buildDir }: PublicConfig) {
        this.buildDir = buildDir;
    }

    getPlugin() {
        return plugin(this.buildDir);
    }

    async initialize() {}

    shutdown() {}
}

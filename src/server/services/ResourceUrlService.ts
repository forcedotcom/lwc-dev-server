import { CompileService, PublicConfig } from '@webruntime/api';
import debugLogger from 'debug';
// @ts-ignore
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';
import { CONTENT_ASSETS, STATIC_RESOURCES } from '../Constants';

const RESOURCE_URL_PREFIX = '@salesforce/resourceUrl/';
const CONTENT_ASSET_URL_PREFIX = '@salesforce/contentAssetUrl/';
const debug = debugLogger('localdevserver:resource');

function isResourceUrlScopedModule(id: string) {
    return id && id.startsWith(RESOURCE_URL_PREFIX);
}

function isContentAssetUrlScopedModule(id: string) {
    return id && id.startsWith(CONTENT_ASSET_URL_PREFIX);
}

function getExportUrl(id: string, buildDir: string, subDir: string) {
    const versionKey = getLatestVersion(buildDir);
    const [resourceName] = id.split('/')[2].split('.');
    const replacement = `/assets/project/${versionKey}/${subDir}/${resourceName}`;

    debug(`resolving ${id} as ${replacement}`);
    return `export default '${replacement}';`;
}

/**
 * Rollup plugin to resolve @salesforce/resourceUrl and
 * @salesforce/contentAssetUrl imports.
 *
 * @param buildDir Absolute path to the webruntime output directory.
 */
function plugin(buildDir: string) {
    return {
        name: 'rollup-plugin-salesforce-resource-urls',

        load(id: string) {
            if (isResourceUrlScopedModule(id)) {
                return getExportUrl(id, buildDir, STATIC_RESOURCES);
            }
            if (isContentAssetUrlScopedModule(id)) {
                return getExportUrl(id, buildDir, CONTENT_ASSETS);
            }
            return null;
        },

        resolveId(id: string) {
            return isResourceUrlScopedModule(id) ||
                isContentAssetUrlScopedModule(id)
                ? id
                : null;
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

    async initialize() { }

    shutdown() { }
}

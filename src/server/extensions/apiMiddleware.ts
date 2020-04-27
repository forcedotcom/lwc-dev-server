import debugLogger from 'debug';
import { Application } from 'express';
import { AppExtensionConfig } from '@webruntime/api';
import { apiMiddleware as webruntimeApiMiddleware } from '@communities-webruntime/extensions/dist/commonjs/api-middleware';

export const API_PATH_PREFIX = '/webruntime/api';
export const DEFAULT_API_VERSION = '48.0';

const debug = debugLogger('localdevserver');

// Webruntime needs to export this interface
export interface ProxyEventListener {
    (proxyReq: any, req: any, res: any): void;
}

// the ApiConfig interface in webruntime needs to be exported, and the version
// rewrite option added, then we can just use that directly
export interface ApiConfig {
    readonly apiPathPrefix?: string;
    readonly apiEndpoint?: string;
    readonly apiEndpointHeaders?: string[];
    readonly apiVersion?: string;
    readonly recordApiCalls?: boolean;
    readonly recordDir: string; // should be optional, but type needs fixing in webruntime
    readonly onProxyReq?: ProxyEventListener;
    readonly pathRewrite?: any;
}

export function apiMiddleware({
    apiPathPrefix = API_PATH_PREFIX,
    apiEndpoint,
    apiEndpointHeaders,
    apiVersion = DEFAULT_API_VERSION,
    recordApiCalls = false,
    recordDir,
    onProxyReq
}: ApiConfig) {
    return {
        extendApp: ({ app }: AppExtensionConfig) => {
            const middleware = webruntimeApiMiddleware({
                apiPathPrefix,
                apiEndpoint,
                apiEndpointHeaders,
                recordApiCalls,
                recordDir,
                onProxyReq,
                pathRewrite: getApiPathRewrite(apiVersion)
            });
            (app as Application).use(middleware);
        }
    };
}

/**
 * Returns a function that strips the local webruntime path prefix and replaces
 * the api version.
 *
 * @param version Replace the api version in the url with this version.
 */
function getApiPathRewrite(version: string) {
    return (originalPath: string) => {
        let newPath = originalPath;
        if (originalPath.startsWith(API_PATH_PREFIX)) {
            newPath = newPath.substring(API_PATH_PREFIX.length);
        }
        newPath = newPath.replace(/v[\d]*\.0/, `v${version}`);
        debug(`rewrote proxy request path: ${originalPath} -> ${newPath}`);
        return newPath;
    };
}

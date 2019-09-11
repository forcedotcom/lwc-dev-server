import { Request, Response, NextFunction } from 'express';
import request, { RequestPromiseAPI } from 'request-promise-native';
import { JSDOM, ResourceLoader, FetchOptions } from 'jsdom';
import debug from 'debug';
import { MAX_RETRIES } from './apexConstants';
import { Cookie } from 'request';
import parse from 'co-body';
import { URL } from 'url';

const log = debug('localdevserver');
const ONE_APP_URL = '/one/one.app';

let cachedConfig: any = null;

/**
 * FIXME: better implementation for GA
 */
export class ApexResourceLoader extends ResourceLoader {
    constructor(
        private readonly orgRequest: RequestPromiseAPI,
        private readonly instanceUrl: string
    ) {
        super();
    }

    fetch(url: string, options: FetchOptions): Promise<Buffer> | null {
        // only load inline.js from the same origin. this is a hack of hacks
        // because by not loading aura framework js we ensure
        // window.Aura.initConfig is always set.
        const instanceUrl = new URL(this.instanceUrl);
        const parsedUrl = new URL(url, this.instanceUrl);
        if (
            instanceUrl.origin == parsedUrl.origin &&
            parsedUrl.pathname.endsWith('/inline.js')
        ) {
            log(
                `loading external url: ${url} as ${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
            );
            return this.orgRequest
                .get({
                    url: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
                })
                .then(res => {
                    return Buffer.from(res);
                });
        }

        log(`skipped external url: ${url}`);
        return null;
    }
}

export interface ConnectionParams {
    instanceUrl: string;
    accessToken: string;
}
interface ApexRequest {
    namespace: string;
    classname: string;
    method: string;
    cacheable: boolean;
    params?: any;
}
export function apexMiddleware(connectionParams: ConnectionParams) {
    return async function(req: Request, res: Response, next: NextFunction) {
        if (req.url.startsWith('/api/apex/execute') && connectionParams) {
            const body = await parse.json(req);
            const classname = body.classname;
            if (typeof classname !== 'string') {
                return sendError(res, 'classname must be specified');
            }
            const method = body.method;
            if (typeof method !== 'string') {
                return sendError(res, 'method must be specified');
            }
            const namespace = body.namespace;
            if (typeof namespace !== 'string') {
                return sendError(res, 'namespace must be specified');
            }
            const cacheable = body.cacheable;
            if (typeof cacheable !== 'boolean') {
                return sendError(res, 'cacheable must be specified');
            }
            // Note: params are optional
            const params = body.params;
            if (!cachedConfig) {
                try {
                    cachedConfig = await getConfig(connectionParams);
                    if (cachedConfig == null) {
                        res.status(500).send(
                            'error parsing or finding aura config: window.Aura not found'
                        );
                        return;
                    }
                } catch (e) {
                    console.error(e);
                    res.status(500).send(e.message);
                    return;
                }
            }

            const apexRequest: ApexRequest = {
                namespace,
                classname,
                method,
                cacheable,
                params
            };

            const response = await callAuraApexRequest(
                connectionParams,
                cachedConfig,
                apexRequest
            );

            try {
                const parsed = JSON.parse(response);
                res.type('json').send(parsed.actions[0].returnValue);
            } catch (e) {
                log(`invalid apex response: ${response}`);
                res.status(500).send(
                    `error parsing apex response: ${e.message}`
                );
            }
            return;
        }
        next();
    };
}

function sendError(res: Response, message: string) {
    res.status(500).send(message);
}

async function callAuraApexRequest(
    connectionParams: ConnectionParams,
    auraconfig: any,
    { namespace, classname, method, cacheable, params }: ApexRequest
) {
    log('Calling apex controller');
    const context = {
        mode: auraconfig.context.mode,
        fwuid: auraconfig.context.fwuid,
        app: auraconfig.context.app,
        loaded: auraconfig.context.loaded,
        dn: auraconfig.context.dn || [],
        globals: auraconfig.context.globals || {},
        uad: auraconfig.context.uad || true
    };

    const auraActionMessage = {
        actions: [
            {
                id: '0',
                descriptor: 'aura://ApexActionController/ACTION$execute',
                callingDescriptor: 'UNKNOWN',
                params: {
                    namespace,
                    classname,
                    method,
                    cacheable,
                    isContinuation: false,
                    params
                }
            }
        ]
    };

    const form = {
        message: JSON.stringify(auraActionMessage),
        'aura.pageURI': '/lightning/n/Apex',
        'aura.context': JSON.stringify(context),
        'aura.token': auraconfig.token
    };

    const orgRequest = getOrgRequest(connectionParams);
    const apexResponse = await orgRequest.post({
        url: '/aura?aura.ApexAction.execute=1',
        form
    });
    return apexResponse;
}

function getOrgRequest({ accessToken, instanceUrl }: ConnectionParams) {
    const jar = request.jar();
    // use as Cookie to override possible undefined, which is impossible
    const sid = request.cookie(`sid=${accessToken}`) as Cookie;
    jar.setCookie(sid, instanceUrl + '/');
    const orgRequest = request.defaults({
        baseUrl: instanceUrl,
        jar
    });
    return orgRequest;
}

async function getConfig(connectionParams: ConnectionParams) {
    log('Getting aura configuration');
    const orgRequest = getOrgRequest(connectionParams);
    const response = await orgRequest.get({
        url: ONE_APP_URL
    });
    if (response.indexOf('window.location.replace(') != -1) {
        throw new Error('error retrieving aura config: unauthenticated');
    }
    const resourceLoader = new ApexResourceLoader(
        orgRequest,
        connectionParams.instanceUrl
    );

    let config: any = null;
    let waitForResolve = function() {};
    let waitForReject = function() {};
    const waitForInitConfig = new Promise((resolve, reject) => {
        waitForResolve = resolve;
        waitForReject = reject;
    });
    const Aura = {};
    const oneApp = new JSDOM(response, {
        resources: resourceLoader,
        runScripts: 'dangerously',
        url: connectionParams.instanceUrl + ONE_APP_URL,
        referrer: connectionParams.instanceUrl + ONE_APP_URL,
        beforeParse: window => {
            Object.defineProperty(window, 'Aura', {
                get: () => Aura,
                set: () => {},
                enumerable: true
            });
            Object.defineProperty(Aura, 'frameworkJsReady', {
                get: () => false,
                set: () => {},
                enumerable: true
            });
            Object.defineProperty(Aura, 'initConfig', {
                get: () => {
                    return config;
                },
                set: newConfig => {
                    log(`Recieved initConfig ${newConfig}`);
                    config = newConfig;
                    waitForResolve();
                },
                enumerable: true
            });
            // @ts-ignore
            window.Aura = Aura;
        }
    });

    const timerid = setTimeout(() => {
        waitForReject();
    }, MAX_RETRIES * 1000);

    try {
        await waitForInitConfig;
        clearTimeout(timerid);
        log(`initConfig Contents = ${JSON.stringify(config)}`);
    } catch (e) {
        if (timerid) {
            clearTimeout(timerid);
        }
        log(`Error waiting for initConfig: ${e}`);
    }

    return config;
}

import { Request, Response, NextFunction } from 'express';
import request, { RequestPromiseAPI } from 'request-promise-native';
import { JSDOM, ResourceLoader, FetchOptions } from 'jsdom';
import debug from 'debug';
import { MAX_RETRIES } from './apexConstants';
import { Cookie } from 'request';
import parse from 'co-body';

const log = debug('localdevserver');
const ONE_APP_URL = '/one/one.app';

let cachedConfig: any = null;

export class ApexResourceLoader extends ResourceLoader {
    constructor(private readonly orgRequest: RequestPromiseAPI) {
        super();
    }
    async fetch(url: string, options: FetchOptions) {
        const opts: { url: string; baseUrl?: string } = {
            url
        };
        if (url.indexOf('//') === 0 || url.indexOf('://') !== -1) {
            // unset baseUrl if url has scheme
            opts.baseUrl = '';
        }
        try {
            const res = await this.orgRequest.get(opts);
            return Promise.resolve(Buffer.from(res));
        } catch (e) {
            log(e);
        }
        return Promise.resolve(Buffer.from(''));
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
                } catch (e) {
                    console.error(e);
                    res.status(500).send(e.message);
                    return;
                }
            }
            const auraconfig = cachedConfig;
            if (!auraconfig) {
                console.error('error retrieving aura config: not set');
                res.status(500).send('error retrieving aura config: not set');
                return;
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
                auraconfig,
                apexRequest
            );

            res.type('json').send(JSON.parse(response).actions[0].returnValue);
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
    log(response);
    if (response.indexOf('window.location.replace(') != -1) {
        throw new Error('error retrieving aura config: unauthenticated');
    }
    const resourceLoader = new ApexResourceLoader(orgRequest);
    const oneApp = new JSDOM(response, {
        resources: resourceLoader,
        runScripts: 'dangerously',
        url: connectionParams.instanceUrl + ONE_APP_URL,
        referrer: connectionParams.instanceUrl + ONE_APP_URL
    });
    let config;
    let error;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const window = oneApp.window;
            // @ts-ignore
            const aura = window.Aura;
            if (aura) {
                config = aura.initConfig;
                break;
            } else {
                error = 'window.Aura not found';
            }
        } catch (e) {
            error = e;
        }
        await sleep(1000);
    }
    if (config === undefined) {
        throw new Error(`error parsing or finding aura config: ${error}`);
    }
    log('retrieved aura configuration');
    return config;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

import { Request, Response, NextFunction } from 'express';
import request from 'request-promise-native';
import { Connection } from '@salesforce/core';
import { JSDOM, ResourceLoader, FetchOptions } from 'jsdom';
import debug from 'debug';

const log = debug('localdevserver');
const ONE_APP_URL = '/one/one.app';

let cachedConfig: any = null;

interface ConnectionParams {
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
export function apexMiddleware({ connection }: { connection?: Connection }) {
    return async function(req: Request, res: Response, next: NextFunction) {
        if (req.url.startsWith('/api/apex/execute') && connection) {
            const classname = req.body.classname;
            if (typeof classname !== 'string') {
                return sendError(res, 'classname must be specified');
            }
            const method = req.body.method;
            if (typeof method !== 'string') {
                return sendError(res, 'method must be specified');
            }
            const namespace = req.body.namespace;
            if (typeof method !== 'string') {
                return sendError(res, 'namespace must be specified');
            }
            const cacheable = req.body.cacheable;
            if (typeof cacheable !== 'boolean') {
                return sendError(res, 'cacheable must be specified');
            }
            // Note: params are optional
            const params = req.body.params;
            if (!cachedConfig) {
                cachedConfig = await getConfig(connection);
            }
            const auraconfig = cachedConfig;
            if (!auraconfig) {
                res.status(500).send('Error retrieving aura config');
                return;
            }

            const response = await callAuraApexRequest(connection, auraconfig, {
                namespace,
                classname,
                method,
                cacheable,
                params
            });

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
    const sid = request.cookie(`sid=${accessToken}`);
    if (sid) {
        jar.setCookie(sid, instanceUrl + '/');
    }
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

    const resourceLoader = new (class extends ResourceLoader {
        async fetch(url: string, options: FetchOptions) {
            const opts: { url: string; baseUrl?: string } = {
                url
            };
            if (url.indexOf('//') === 0 || url.indexOf('://') !== -1) {
                // unset baseUrl if url has scheme
                opts.baseUrl = '';
            }
            try {
                const res = await orgRequest.get(opts);
                return Promise.resolve(Buffer.from(res));
            } catch (e) {
                log(e);
            }
            return Promise.resolve(Buffer.from(''));
        }
    })();

    const oneApp = new JSDOM(response, {
        resources: resourceLoader,
        runScripts: 'dangerously',
        url: connectionParams.instanceUrl + ONE_APP_URL,
        referrer: connectionParams.instanceUrl + ONE_APP_URL
    });
    let config;
    // 30 seconds....
    for (let i = 0; i < 30; i++) {
        try {
            // @ts-ignore
            config = oneApp.window.Aura.initConfig;
            if (config) {
                break;
            }
        } catch (ignore) {}
        await sleep(1000);
    }
    return config;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
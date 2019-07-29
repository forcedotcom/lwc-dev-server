import { Request, Response, NextFunction } from 'express';
import request from 'request-promise-native';
import { Connection } from '@salesforce/core';
import { JSDOM, ResourceLoader, FetchOptions } from 'jsdom';

let cachedConfig: any = null;

export function apexMiddleware({ connection }: { connection?: Connection }) {
    return async function(req: Request, res: Response, next: NextFunction) {
        if (req.url.startsWith('/api/apex/execute') && connection) {
            const classname = req.body.classname;
            // TODO throw if not present
            const method = req.body.method;
            // TODO throw if not present
            const namespace = req.body.namespace;
            // TODO throw if not present
            const cacheable = req.body.cacheable;
            // TODO throw if not present

            if (!cachedConfig) {
                cachedConfig = await getConfig(connection);
            }
            const auraconfig = cachedConfig;
            if (!auraconfig) {
                console.log('No aura config!');
                res.sendStatus(500);
                return;
            }

            const response = await callAuraApexRequest(connection, auraconfig, {
                namespace,
                classname,
                method,
                cacheable
            });

            res.type('json').send(JSON.parse(response).actions[0].returnValue);
            return;
        }
        next();
    };
}
async function callAuraApexRequest(
    connection: Connection,
    auraconfig: any,
    {
        namespace,
        classname,
        method,
        cacheable
    }: {
        namespace: string;
        classname: string;
        method: string;
        cacheable: string;
    }
) {
    console.log('Calling apex controller');
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
                    isContinuation: false
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

    const orgRequest = getOrgRequest(connection);
    const apexResponse = await orgRequest.post({
        url: '/aura?r=18&aura.ApexAction.execute=1',
        form
    });
    debugger;
    return apexResponse;
}

function getOrgRequest(connection: Connection) {
    const jar = request.jar();
    const sid = request.cookie(`sid=${connection.accessToken}`);
    if (sid) {
        jar.setCookie(sid, connection.instanceUrl + '/');
    }
    const orgRequest = request.defaults({
        baseUrl: connection.instanceUrl,
        jar
    });
    return orgRequest;
}

async function getConfig(connection: Connection) {
    console.log('Getting aura configuration');
    const orgRequest = getOrgRequest(connection);
    const response = await orgRequest.get({
        url: '/one/one.app'
    });

    const resourceLoader = new (class extends ResourceLoader {
        async fetch(url: string, options: FetchOptions) {
            let res;
            try {
                if (url.indexOf('//') === 0 || url.indexOf('://') !== -1) {
                    res = await orgRequest.get({
                        baseUrl: '',
                        url
                    });
                } else {
                    res = await orgRequest.get({
                        url
                    });
                }
            } catch (e) {
                console.log(e);
                res = '';
            }
            return Promise.resolve(Buffer.from(res));
        }
    })({});

    const oneApp = new JSDOM(response, {
        resources: resourceLoader,
        runScripts: 'dangerously',
        url: connection.instanceUrl + '/one/one.app',
        referrer: connection.instanceUrl + '/one/one.app'
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

import { ConnectionParams, ApexResourceLoader } from '../apexMiddleware';
import { WAIT_FOR_ONE_APP_LOAD } from '../apexConstants';

function mockRequestFactory() {
    const original = require.requireActual('request-promise-native');
    const mockRequest: any = {
        cookie: jest.fn(args => original.cookie.call(original, ...args)),
        jar: jest.fn(() => {
            return {
                setCookie: jest.fn()
            };
        }),
        // ...original, //Pass down all the exported objects
        get: jest.fn(() => {
            console.log('I didnt call the original');
        }),
        post: jest.fn(() => {
            console.log('I didnt call the original post');
        }),
        defaults: jest.fn((...args) => {
            return mockRequest;
        })
    };
    return mockRequest;
}
jest.mock('request-promise-native', () => mockRequestFactory());
jest.mock('co-body', () => {
    return {
        json: (req: any) => {
            return Promise.resolve(req.body);
        }
    };
});

function getMiddleware(connection: ConnectionParams) {
    const { apexMiddleware } = require('../apexMiddleware');
    return apexMiddleware(connection);
}
function getRequest() {
    const request = require('request-promise-native');
    return request;
}
describe('apexMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
    afterEach(() => {
        jest.unmock('../apexConstants');
    });
    it('ignores non apex call ', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/non-apex'
        };
        const res: any = jest.fn();
        const next: any = jest.fn();

        await middleware(req, res, next);
        expect(res).not.toBeCalled();
        expect(next).toBeCalledTimes(1);
    });

    it('apex call has sid cookie', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        jest.doMock('../apexConstants', () => {
            return { WAIT_FOR_ONE_APP_LOAD: 0 };
        });
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            status: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementation(() => {
            return Promise.resolve('');
        });

        await middleware(req, res, next);

        expect(request.jar).toHaveBeenCalled();
        expect(request.cookie).toHaveBeenCalledWith('sid=XXX');
        const cookie = request.cookie.mock.results[0].value;
        expect(
            request.jar.mock.results[0].value.setCookie
        ).toHaveBeenCalledWith(cookie, 'http://url/');
    });

    it('unauthenticated aura config response', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            status: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementation(() => {
            return Promise.resolve(`<html><body><script>
            function redirectOnLoad() {
            if (this.SfdcApp && this.SfdcApp.projectOneNavigator) { SfdcApp.projectOneNavigator.handleRedirect('https://force-site-2021-dev-ed.cs47.my.salesforce.com?ec=302&startURL=%2Fone%2Fone.app'); }  else
            if (window.location.replace){
            window.location.replace('https://force-site-2021-dev-ed.cs47.my.salesforce.com?ec=302&startURL=%2Fone%2Fone.app');
            } else {
            window.location.href ='https://force-site-2021-dev-ed.cs47.my.salesforce.com?ec=302&startURL=%2Fone%2Fone.app';
            }
            }
            redirectOnLoad();
            </script>
            </body></html>`);
        });

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenLastCalledWith(
            'error retrieving aura config: unauthenticated'
        );
        expect(next).not.toBeCalled();
    });

    it('apex call without params', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementation((params: any) => {
            if (params.url.endsWith('inline.js')) {
                return Promise.resolve(`
                window.Aura = {};
                window.Aura.initConfig = ${JSON.stringify({
                    token: 'TOKEN',
                    context: {
                        mode: 'MODE',
                        fwuid: 'FWUID',
                        app: 'APP',
                        dn: [],
                        globals: {},
                        uad: 1
                    }
                })};
                `);
            }
            // using a two phase loader will excersize async + resource loader
            return Promise.resolve(
                `<html><body><script src="/inline.js"></script></body></html>`
            );
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);

        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":1}',
                'aura.token': 'TOKEN'
            }
        };
        expect(request.post).toHaveBeenCalledWith(expectedArgument);
        expect(res.send).toHaveBeenCalledWith({ mockReturn: {} });
        expect(res.type).toHaveBeenLastCalledWith('json');
        expect(next).not.toBeCalled();
    });

    it('apex call without params - caching config', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementation(() => {
            return Promise.resolve(`<html><body>
            <script>
            window.Aura = {};
            window.Aura.initConfig = ${JSON.stringify({
                token: 'TOKEN',
                context: {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: 1
                }
            })};
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementation(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);

        jest.clearAllMocks();

        // this one should be cached
        await middleware(req, res, next);

        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":1}',
                'aura.token': 'TOKEN'
            }
        };
        expect(request.post).toHaveBeenCalledWith(expectedArgument);
        expect(res.send).toHaveBeenCalledWith({ mockReturn: {} });
        expect(res.type).toHaveBeenLastCalledWith('json');
        expect(next).not.toBeCalled();
    });

    it('apex call with params', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false,
                params: {
                    wrapper: {
                        p: 1
                    }
                }
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementationOnce(() => {
            return Promise.resolve(`<html><body>
            <script>
            window.Aura = {};
            window.Aura.initConfig = ${JSON.stringify({
                token: 'TOKEN',
                context: {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: 1
                }
            })};
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);
        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false,"params":{"wrapper":{"p":1}}}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":1}',
                'aura.token': 'TOKEN'
            }
        };

        expect(request.post).toHaveBeenCalledWith(expectedArgument);
        expect(res.send).toHaveBeenCalledWith({ mockReturn: {} });
        expect(res.type).toHaveBeenLastCalledWith('json');
        expect(next).not.toBeCalled();
    });

    it('sends 500 if error parsing apex response', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementation((params: any) => {
            if (params.url.endsWith('inline.js')) {
                return Promise.resolve(`
                window.Aura = {};
                window.Aura.initConfig = ${JSON.stringify({
                    token: 'TOKEN',
                    context: {
                        mode: 'MODE',
                        fwuid: 'FWUID',
                        app: 'APP',
                        dn: [],
                        globals: {},
                        uad: 1
                    }
                })};
                `);
            }
            // using a two phase loader will excersize async + resource loader
            return Promise.resolve(
                `<html><body><script src="/inline.js"></script></body></html>`
            );
        });
        //@ts-ignore
        request.post.mockImplementationOnce(() => `*/ error`);

        await middleware(req, res, next);

        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":1}',
                'aura.token': 'TOKEN'
            }
        };
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenLastCalledWith(
            'error parsing apex response: Unexpected token * in JSON at position 0'
        );
        expect(next).not.toBeCalled();
    });

    it('sends returns error message from action response', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementation((params: any) => {
            if (params.url.endsWith('inline.js')) {
                return Promise.resolve(`
                window.Aura = {};
                window.Aura.initConfig = ${JSON.stringify({
                    token: 'TOKEN',
                    context: {
                        mode: 'MODE',
                        fwuid: 'FWUID',
                        app: 'APP',
                        dn: [],
                        globals: {},
                        uad: 1
                    }
                })};
                `);
            }
            // using a two phase loader will excersize async + resource loader
            return Promise.resolve(
                `<html><body><script src="/inline.js"></script></body></html>`
            );
        });
        //@ts-ignore
        request.post.mockImplementationOnce(() =>
            JSON.stringify({
                actions: [{ state: 'ERROR', error: [{ message: 'expected' }] }]
            })
        );

        await middleware(req, res, next);

        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":1}',
                'aura.token': 'TOKEN'
            }
        };
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenLastCalledWith(
            JSON.parse('{"error":[{"message":"expected"}]}')
        );
        expect(next).not.toBeCalled();
    });

    it('no auraconfig sends 500', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        jest.doMock('../apexConstants', () => {
            return { WAIT_FOR_ONE_APP_LOAD: 0 };
        });
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementationOnce(() => {
            return Promise.resolve(`<html><body>
            <script>
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenLastCalledWith(
            'error parsing or finding aura config: window.Aura not found'
        );
        expect(next).not.toBeCalled();
    });

    it('sends 500 if window.Aura does not contain a initConfig property', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        jest.doMock('../apexConstants', () => {
            return { WAIT_FOR_ONE_APP_LOAD: 0 };
        });
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementationOnce(() => {
            return Promise.resolve(`<html><body>
            <script>
            window.Aura = {};
            window.Aura.changeConfig = ${JSON.stringify({
                token: 'TOKEN',
                context: {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: 1
                }
            })};
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenLastCalledWith(
            'error parsing or finding aura config: window.Aura not found'
        );
        expect(next).not.toBeCalled();
    });

    it('auraconfig defaults', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementationOnce(() => {
            return Promise.resolve(`<html><body>
            <script>
            window.Aura = {};
            window.Aura.initConfig = ${JSON.stringify({
                token: 'TOKEN',
                context: {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: true
                }
            })};
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);
        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":true}',
                'aura.token': 'TOKEN'
            }
        };

        expect(request.post).toHaveBeenCalledWith(expectedArgument);
        expect(res.send).toHaveBeenCalledWith({ mockReturn: {} });
        expect(res.type).toHaveBeenLastCalledWith('json');
        expect(next).not.toBeCalled();
    });

    it('initConfig called after frameworkJsReady set to true', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementationOnce(() => {
            return Promise.resolve(`<html><body>
            <script>
            window.Aura = {};
            window.Aura.frameworkJsReady = true;
            const initConfig = ${JSON.stringify({
                token: 'TOKEN',
                context: {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: true
                }
            })};
            // Trace that this was false still
            initConfig.token += ':' + window.Aura.frameworkJsReady;
            window.Aura.initConfig = initConfig;
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);
        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":true}',
                'aura.token': 'TOKEN:false'
            }
        };

        expect(request.post).toHaveBeenCalledWith(expectedArgument);
        expect(res.send).toHaveBeenCalledWith({ mockReturn: {} });
        expect(res.type).toHaveBeenLastCalledWith('json');
        expect(next).not.toBeCalled();
    });

    it('accessing init config returns the initConfig object', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res)
        };
        const next: any = jest.fn();

        const request = getRequest();
        //@ts-ignore
        request.get.mockImplementationOnce(() => {
            return Promise.resolve(`<html><body>
            <script>
            window.Aura = {};
            window.Aura.initConfig = ${JSON.stringify({
                token: 'TOKEN',
                context: {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: true
                }
            })};
            window.Aura.initConfig = window.Aura.initConfig;
            </script>
            </body></html>`);
        });
        //@ts-ignore
        request.post.mockImplementationOnce(
            () => `{"actions": [{"returnValue": {"mockReturn":{}}}] }`
        );

        await middleware(req, res, next);
        //@ts-ignore
        const expectedArgument = {
            url: '/aura?aura.ApexAction.execute=1',
            form: {
                message:
                    '{"actions":[{"id":"0","descriptor":"aura://ApexActionController/ACTION$execute","callingDescriptor":"UNKNOWN","params":{"namespace":"namespace","classname":"classname","method":"method","cacheable":false,"isContinuation":false}}]}',
                'aura.pageURI': '/lightning/n/Apex',
                'aura.context':
                    '{"mode":"MODE","fwuid":"FWUID","app":"APP","dn":[],"globals":{},"uad":true}',
                'aura.token': 'TOKEN'
            }
        };

        expect(request.post).toHaveBeenCalledWith(expectedArgument);
        expect(res.send).toHaveBeenCalledWith({ mockReturn: {} });
        expect(res.type).toHaveBeenLastCalledWith('json');
        expect(next).not.toBeCalled();
    });

    it('apex call missing classname', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                method: 'method',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('classname must be specified');
        expect(next).not.toBeCalled();
    });

    it('apex call missing method', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                namespace: 'namespace',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('method must be specified');
        expect(next).not.toBeCalled();
    });

    it('apex call missing namespace', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                cacheable: false
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('namespace must be specified');
        expect(next).not.toBeCalled();
    });

    it('apex call missing cacheable', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        const middleware = getMiddleware(mockConnection);
        const req: any = {
            url: '/api/apex/execute',
            body: {
                classname: 'classname',
                method: 'method',
                namespace: 'namespace'
            }
        };
        const res: any = {
            type: jest.fn(() => res),
            send: jest.fn(() => res),
            status: jest.fn(() => res)
        };
        const next: any = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('cacheable must be specified');
        expect(next).not.toBeCalled();
    });
});
describe('apexResourceLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('loads requests for inline.js', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('value');
        });

        const loader = new ApexResourceLoader(
            request,
            'https://na132.salesforce.com'
        );
        const response = await loader.fetch('/inline.js', {});

        expect(request.get).toBeCalledWith({
            url: '/inline.js'
        });
        // @ts-ignore
        expect(response.toString()).toBe('value');
    });

    it('loads requests for inline.js url with query string and extra paths', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('value');
        });

        const loader = new ApexResourceLoader(
            request,
            'https://na132.salesforce.com'
        );
        const url =
            '/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22SMRgtHXIUVBtPJBYLBvdxw%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%224LN5cnym63OOBP3Bk7ufaQ%22%7D%2C%22mlr%22%3A1%2C%22pathPrefix%22%3A%22%22%2C%22dns%22%3A%22c%22%2C%22ls%22%3A1%2C%22ct%22%3A1%7D/inline.js?jwt=abcdefgiOiJIUzI1NiIsinR5cCI6IkpXVCJ9..eKKHtlCa5k-ffFBJkUABypc8WZPl1Vet-KBVlIRrvTc';
        const response = await loader.fetch(url, {});

        expect(request.get).toBeCalledWith({
            url
        });
        // @ts-ignore
        expect(response.toString()).toBe('value');
    });

    it('loads requests for inline.js when absolute', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('value');
        });

        const origin = 'https://na132.salesforce.com';
        const loader = new ApexResourceLoader(request, origin);
        const url =
            '/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22SMRgtHXIUVBtPJBYLBvdxw%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%224LN5cnym63OOBP3Bk7ufaQ%22%7D%2C%22mlr%22%3A1%2C%22pathPrefix%22%3A%22%22%2C%22dns%22%3A%22c%22%2C%22ls%22%3A1%2C%22ct%22%3A1%7D/inline.js?jwt=abcdefgiOiJIUzI1NiIsinR5cCI6IkpXVCJ9..eKKHtlCa5k-ffFBJkUABypc8WZPl1Vet-KBVlIRrvTc';
        const response = await loader.fetch(origin + url, {});

        expect(request.get).toBeCalledWith({
            url
        });
        // @ts-ignore
        expect(response.toString()).toBe('value');
    });

    it('does not call get on the request if the url does not match the expected origin', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('');
        });

        const loader = new ApexResourceLoader(
            request,
            'https://na132.salesforce.com'
        );
        const response = await loader.fetch(
            'https://321.salesforce.com/inline.js',
            {}
        );

        expect(request.get).not.toBeCalled();
        expect(response).toBeNull();
    });

    it('does not call get on the request for non inline.js urls', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('value');
        });

        const loader = new ApexResourceLoader(
            request,
            'https://na132.salesforce.com'
        );
        const response = await loader.fetch('/app.css', {});

        expect(request.get).not.toBeCalled();
        expect(response).toBeNull();
    });

    it('returns null on errors', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.reject(new Error('test error'));
        });

        const loader = new ApexResourceLoader(
            request,
            'https://na132.salesforce.com'
        );

        expect(loader.fetch('/inline.js', {})).rejects.toEqual(
            new Error('test error')
        );

        expect(request.get).toBeCalledWith({
            url: '/inline.js'
        });
    });
});

import { ConnectionParams, ApexResourceLoader } from '../apexMiddleware';
import { MAX_RETRIES } from '../apexConstants';

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
            return { MAX_RETRIES: 1 };
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
                window.Aura.initConfig = {};
                window.Aura.initConfig.token = 'TOKEN';
                window.Aura.initConfig.context = {};
                window.Aura.initConfig.context = {
                    mode: 'MODE',
                    fwuid: 'FWUID',
                    app: 'APP',
                    dn: [],
                    globals: {},
                    uad: 1
                };
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
            window.Aura.initConfig = {};
            window.Aura.initConfig.token = 'TOKEN';
            window.Aura.initConfig.context = {};
            window.Aura.initConfig.context = {
                mode: 'MODE',
                fwuid: 'FWUID',
                app: 'APP',
                dn: [],
                globals: {},
                uad: 1
            };
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
            window.Aura.initConfig = {};
            window.Aura.initConfig.token = 'TOKEN';
            window.Aura.initConfig.context = {};
            window.Aura.initConfig.context = {
                mode: 'MODE',
                fwuid: 'FWUID',
                app: 'APP',
                dn: [],
                globals: {},
                uad: 1
            };
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
    it('no auraconfig sends 500', async () => {
        const mockConnection = {
            instanceUrl: 'http://url',
            accessToken: 'XXX'
        };
        jest.doMock('../apexConstants', () => {
            return { MAX_RETRIES: 1 };
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
            'error retrieving aura config: not set'
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
            window.Aura.initConfig = {};
            window.Aura.initConfig.token = 'TOKEN';
            window.Aura.initConfig.context = {};
            window.Aura.initConfig.context = {
                mode: 'MODE',
                fwuid: 'FWUID',
                app: 'APP',
            };
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
    it('load from absolute', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('');
        });
        const loader = new ApexResourceLoader(request);

        await loader.fetch('http://other', {});

        expect(request.get).toBeCalledWith({
            url: 'http://other',
            baseUrl: ''
        });
    });
    it('load from non-absolute', async () => {
        const request = getRequest();
        request.get.mockImplementation(() => {
            return Promise.resolve('');
        });
        const loader = new ApexResourceLoader(request);

        await loader.fetch('/other', {});

        expect(request.get).toBeCalledWith({
            url: '/other'
        });
    });
    it('logs exception on error', async () => {
        const request = getRequest();
        const loader = new ApexResourceLoader(request);

        request.get.mockImplementation(() => {
            throw new Error('bad');
        });
        const response = await loader.fetch('/other', {});

        expect(request.get).toBeCalledWith({
            url: '/other'
        });
        expect(response.toString()).toBe('');
    });
});

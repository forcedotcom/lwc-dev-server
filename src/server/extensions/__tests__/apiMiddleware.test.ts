import express, { Application } from 'express';
import {
    apiMiddleware,
    ApiConfig,
    API_PATH_PREFIX,
    DEFAULT_API_VERSION
} from '../apiMiddleware';
import { ExtensionOptions } from '@webruntime/api';
import { apiMiddleware as webruntimeApiMiddleware } from '@communities-webruntime/extensions/dist/commonjs/api-middleware';

jest.mock('express', () => {
    return jest.fn(() => {
        return {
            get: jest.fn(),
            use: jest.fn()
        };
    });
});

jest.mock('@communities-webruntime/extensions/dist/commonjs/api-middleware');

describe('apiMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a LWR extension', () => {
        const extension = apiMiddleware({
            recordDir: '/foo'
        });

        expect(extension).toHaveProperty('extendApp');
    });

    describe('extendApp', () => {
        let app: Application;
        let options: ExtensionOptions;

        beforeEach(() => {
            app = express();
        });

        it('should call the webruntime middleware with the default path prefix', () => {
            const apiConfig: ApiConfig = {
                recordDir: '/project/.localdevserver/api'
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            expect(webruntimeApiMiddleware).toBeCalledWith(
                expect.objectContaining({
                    apiPathPrefix: API_PATH_PREFIX
                })
            );
        });

        it('should call the webruntime middleware with the specified path prefix', () => {
            let apiPathPrefix = '/api';

            const apiConfig: ApiConfig = {
                apiPathPrefix,
                recordDir: '/project/.localdevserver/api'
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            expect(webruntimeApiMiddleware).toBeCalledWith(
                expect.objectContaining({
                    apiPathPrefix
                })
            );
        });

        it('should call the webruntime middleware with the specified api endpoint', () => {
            let apiEndpoint = 'https://api-endpoint.saleforce.com';
            const apiConfig: ApiConfig = {
                apiEndpoint,
                recordDir: '/project/.localdevserver/api'
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            expect(webruntimeApiMiddleware).toBeCalledWith(
                expect.objectContaining({
                    apiEndpoint
                })
            );
        });

        it('should call the webruntime middleware with the specified api endpoint headers', () => {
            let apiEndpointHeaders = ['Header:Value'];
            const apiConfig: ApiConfig = {
                apiEndpointHeaders,
                recordDir: '/project/.localdevserver/api'
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            expect(webruntimeApiMiddleware).toBeCalledWith(
                expect.objectContaining({
                    apiEndpointHeaders
                })
            );
        });

        it('should call the webruntime middleware with the specified onProxyReq', () => {
            let onProxyReq = jest.fn();
            const apiConfig: ApiConfig = {
                onProxyReq,
                recordDir: '/project/.localdevserver/api'
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            expect(webruntimeApiMiddleware).toBeCalledWith(
                expect.objectContaining({
                    onProxyReq
                })
            );
        });

        it('should call the webruntime middleware with the specified recordDir', () => {
            let recordDir = '/project/.localdevserver/api';

            const apiConfig: ApiConfig = {
                recordDir
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            expect(webruntimeApiMiddleware).toBeCalledWith(
                expect.objectContaining({
                    recordDir
                })
            );
        });

        it('should rewrite the api path with the default api version', () => {
            const apiConfig: ApiConfig = {
                recordDir: '/project/.localdevserver/api'
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            // @ts-ignore
            const config = webruntimeApiMiddleware.mock.calls[0][0];
            const apiPath = config.pathRewrite(
                '/webruntime/api/services/data/v49.0/ui-api/records'
            );
            const newApiPath = config.pathRewrite(apiPath);

            expect(newApiPath).toBe(
                `/services/data/v${DEFAULT_API_VERSION}/ui-api/records`
            );
        });

        it('should rewrite the api path with the specified api version', () => {
            const apiVersion = '40.0';

            const apiConfig: ApiConfig = {
                recordDir: '/project/.localdevserver/api',
                apiVersion
            };

            const extension = apiMiddleware(apiConfig);
            extension.extendApp({ app, options });

            // @ts-ignore
            const config = webruntimeApiMiddleware.mock.calls[0][0];
            const apiPath = config.pathRewrite(
                '/webruntime/api/services/data/v49.0/ui-api/records'
            );
            const newApiPath = config.pathRewrite(apiPath);

            expect(newApiPath).toBe(
                `/services/data/v${apiVersion}/ui-api/records`
            );
        });
    });
});

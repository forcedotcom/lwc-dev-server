import mockFs from 'mock-fs';
import { Request as ExpressRequest } from 'express';
import { LocalDevPage, LocalDevApp } from '../LocalDevApp';
import { getWebAppVersionKey } from '../../../common/versionUtils';
import {
    ApplicationConfig,
    PublicConfig,
    DEFAULT_CONFIG
} from '@webruntime/api';

jest.mock('../../../common/versionUtils');

describe('LocalDevApp.ts', () => {
    let appConfig: ApplicationConfig;
    let req: ExpressRequest;
    let locals: object;
    let publicConfig: PublicConfig;

    beforeEach(() => {
        mockFs({
            'src/index.html': '<!DOCTYPE html><html></html>'
        });

        appConfig = {
            defaultComponent: 'my/app',
            defaultTemplate: 'src/index.html'
        };

        req = {
            path: '/',
            secure: true
        } as ExpressRequest;

        locals = { sessionNonce: 'fakeSessionNonce' };

        publicConfig = Object.assign({}, DEFAULT_CONFIG);
    });

    afterEach(() => {
        mockFs.restore();
        jest.restoreAllMocks();
    });

    describe('The LocalDevApp class', () => {
        it('the pages method returns at least one route', () => {
            const pages = new LocalDevApp(appConfig).pages;
            expect(pages.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('the LocalDevPage class', () => {
        it('defines externals with Webruntime.define in experimental_scripts', () => {
            const app = new LocalDevApp(appConfig);
            const page = new LocalDevPage(app, req, locals, publicConfig);

            const scripts = page.experimental_scripts;

            expect(scripts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        code: expect.stringContaining('Webruntime.define')
                    })
                ])
            );
        });

        it('replaces {sessionNonce} in experimental_content', () => {
            mockFs({
                'src/index.html': `<!DOCTYPE html>
                <html>
                    <head>
                        <meta name="sessionNonce" content="{sessionNonce}" />
                    </head>
                    <body></body>
                </html>`
            });

            const app = new LocalDevApp(appConfig);
            const page = new LocalDevPage(app, req, locals, publicConfig);

            const content = page.experimental_content;

            expect(content).toMatch(
                '<meta name="sessionNonce" content="fakeSessionNonce" />'
            );
        });

        it('replaces {basePath} in experimental_content', () => {
            mockFs({
                'src/index.html': `<!DOCTYPE html>
                <html>
                    <head>
                        <link rel="stylesheet" href="{basePath}/css/foo.css" />
                    </head>
                    <body></body>
                </html>`
            });

            publicConfig.server.basePath = 'fakeBasePath';

            const app = new LocalDevApp(appConfig);
            const page = new LocalDevPage(app, req, locals, publicConfig);

            const content = page.experimental_content;

            expect(content).toMatch(
                '<link rel="stylesheet" href="fakeBasePath/css/foo.css" />'
            );
        });

        it('replaces {versionKey} in experimental_content', () => {
            mockFs({
                'src/index.html': `<!DOCTYPE html>
                <html>
                    <head>
                        <link rel="stylesheet" href="/css/foo.css?{versionKey}" />
                    </head>
                    <body></body>
                </html>`
            });

            const expectedVersionKey = '123123';
            (getWebAppVersionKey as jest.Mock).mockReturnValue(
                expectedVersionKey
            );

            const app = new LocalDevApp(appConfig);
            const page = new LocalDevPage(app, req, locals, publicConfig);

            const content = page.experimental_content;

            expect(content).toMatch(
                `<link rel="stylesheet" href="/css/foo.css?${expectedVersionKey}" />`
            );
        });
    });
});

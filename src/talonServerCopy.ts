/*
 * Essentially a copy of @talon/compiler/src/server/server.js
 * Splits the run method into createServer / startServer methods.
 * Ideally we can move this back into talon once we determine how best
 * to expose talon's express server for configuration
 *
 */
import {
    templateMiddleware,
    resourceMiddleware,
    apiMiddleware
} from '@talon/compiler';
import { startContext, endContext } from '@talon/compiler';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import uuidv4 from 'uuidv4';
import colors from 'colors';
import ComponentIndex from './common/ComponentIndex';
import Project from './common/Project';
import fs from 'fs';
import { Parser } from 'xml2js';
import mimeTypes from 'mime-types';

const { log } = console;

const frameworkResourcesJson = require.resolve(
    '@talon/framework/dist/resources.json'
);
const frameworkOutputDir = path.dirname(frameworkResourcesJson);

const staticOptions = {
    index: false,
    immutable: true,
    maxAge: 31536000
};

export async function createServer(options: object, proxyConfig: any = {}) {
    const { templateDir, outputDir, basePath } = await startContext(options);
    const app = express();

    // 0. GZIP all assets
    app.use(compression());

    // 1. CSP for script-src directive
    // @ts-ignore
    app.use((req, res, next) => {
        res.locals.nonce = uuidv4();
        next();
    });

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    scriptSrc: [
                        `'self'`,
                        (req: any, res: any) => `'nonce-${res.locals.nonce}'`
                    ]
                }
            }
        })
    );

    // 2. resource middleware, compile component or views if needed and redirect to the generated resource
    app.use(`${basePath}/talon/`, resourceMiddleware());

    // 3. Serve up static files
    // handle Salesforce static resource imported using @salesforce/resourceUrl/<resourceName>
    // remove versionKey from resourceURL and forward the request
    app.get(`${basePath}/assets/:versionKey/*`, (req, res, next) => {
        // Ignore for our SLDS routes
        log(req.url);

        // Weird edge case where file extension isn't included for staticresource resolution
        // except when the resource is part of an application/zip. Examples from lwc-recipes:
        // libsD3 - resolution works properly because its metadata contentType is <contentType>application/zip</contentType>
        // libsChartjs - resolution fails because its metadata contentType is <contentType>application/javascript</contentType>
        if (req.url.indexOf('.') === -1) {
            // TODO make this work on windows
            req.url = `${basePath}/assets/${req.params[0]}`;
            const xmlFileName =
                '.localdevserver/public' + req.url + '.resource-meta.xml';
            // Let's try to grab the file extension from the metadata.xml file
            const parser = new Parser();
            if (fs.existsSync(xmlFileName)) {
                const data = fs.readFileSync(xmlFileName);
                parser.parseString(data, function(err: any, result: any) {
                    // Parse the xml into json
                    if (result) {
                        const contentType =
                            result.StaticResource.contentType[0];
                        const fileExt = mimeTypes.extension(contentType);
                        // Tack on the file extension and send it through
                        req.url = req.url + '.' + fileExt;
                        next('route');
                    }
                });
            } else {
                // No metadata file, send along the request and pray
                next();
            }
        } else {
            if (
                req.url.indexOf('/assets/styles/') === -1 &&
                req.url.indexOf('/assets/fonts/') === -1 &&
                req.url.indexOf('/assets/icons/') === -1
            ) {
                req.url = `${basePath}/assets/${req.params[0]}`;
                next('route');
            } else {
                next();
            }
        }
    });

    app.use(
        `${basePath}/`,
        express.static(`${frameworkOutputDir}/public/`, staticOptions)
    );
    app.use(
        `${basePath}/`,
        express.static(`${outputDir}/public/`, staticOptions)
    );

    // 4. proxy, record and replay API calls
    app.use(
        `${basePath}/api`,
        apiMiddleware({
            target: proxyConfig.apiEndpoint,
            record: proxyConfig.recordApiCalls,
            recordDir: path.resolve(templateDir, 'api'),
            onProxyReq: proxyConfig.onProxyReq,
            pathRewrite: proxyConfig.pathRewrite
        })
    );

    return app;
}

export async function startServer(app: any, basePath: string, port = 3000) {
    // 5. If none found, serve up the page for the current route depending on the path
    app.get(`${basePath}/*`, templateMiddleware());

    // start the server
    const server = app.listen(port, () => {
        log(
            colors.magenta.bold(
                `Server up on http://localhost:${
                    server.address().port
                }${basePath}`
            )
        );
    });

    server.on('close', () => {
        endContext();
    });

    process.on('SIGINT', () => {
        server.close();
    });

    return server;
}

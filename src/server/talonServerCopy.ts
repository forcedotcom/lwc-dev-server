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
    apiMiddleware,
    compileErrorMiddleware
} from '@talon/compiler';
import { startContext, endContext } from '@talon/compiler';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import uuidv4 from 'uuidv4';
import colors from 'colors';
import fs from 'fs';
import { Parser } from 'xml2js';
import mimeTypes from 'mime-types';
import debugLogger from 'debug';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

const PUBLIC_DIR = 'public';

const debug = debugLogger('localdevserver');
const { log } = console;

const FRAMEWORK_RESOURCE_JSON = require.resolve(
    '@talon/framework/dist/resources.json'
);
const FRAMEWORK_OUTPUT_DIR = path.dirname(FRAMEWORK_RESOURCE_JSON);

/**
 * The path to the directory containing Talon framework static files.
 *
 * To be used with `express.static`.
 *
 * @example
 *
 * const { FRAMEWORK_PUBLIC_DIR } = require('@talon/compiler');
 *
 * app.use(express.static(FRAMEWORK_PUBLIC_DIR));
 *
 * @public
 */
const FRAMEWORK_PUBLIC_DIR = `${FRAMEWORK_OUTPUT_DIR}/public/`;

const staticOptions = {
    index: false,
    immutable: true,
    maxAge: 31536000
};

function getRootApp(app: any, basePath: string) {
    if (basePath) {
        const rootApp = express();
        rootApp.use(basePath, app);
        return rootApp;
    }

    return app;
}

export async function createServer(options: object, apiConfig: any = {}) {
    const { templateDir, outputDir, basePath, srcDir } = await startContext(
        options
    );
    const sourceDir = path.resolve(srcDir);
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

    // Setup CSRF Token
    app.use(cookieParser());
    app.use(csurf({ cookie: true }));

    // 2. resource middleware, compile component or views if needed and redirect to the generated resource
    app.use(resourceMiddleware());

    // 3. Serve up static files
    // handle Salesforce static resource imported using @salesforce/resourceUrl/<resourceName>
    // remove versionKey from resourceURL and forward the request
    app.get(`/assets/:versionKey/*`, (req, res, next) => {
        // Ignore for our SLDS routes
        debug(req.url);

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

    // Serve static files from Talon framework public dir
    app.use(express.static(FRAMEWORK_PUBLIC_DIR, staticOptions));

    // Serve static files from the template public dir
    app.use(express.static(`${outputDir}/${PUBLIC_DIR}`, staticOptions));

    // Proxy, record and replay API calls
    app.use(apiMiddleware(apiConfig));

    // LWC-DEV-SERVER: Show source handler
    app.use(`/show`, (req, res, next) => {
        const file = req.query.file;
        if (file) {
            if (file.startsWith(sourceDir)) {
                res.sendFile(file);
            }
        }
    });

    return app;
}

export async function startServer(app: any, basePath: string, port = 3000) {
    // If none found, serve up the page for the current route depending on the path
    app.get(`${basePath}/*`, templateMiddleware());

    // Error handling
    app.use(compileErrorMiddleware());

    // Start the server
    const server = getRootApp(app, basePath).listen(port, () => {
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

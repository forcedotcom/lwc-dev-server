/*
 * Essentially a copy of @talon/compiler/src/server/server.js
 * Splits the run method into createServer / startServer methods.
 * Ideally we can move this back into talon once we determine how best
 * to expose talon's express server for configuration
 *
 */
import {
    apiMiddleware,
    compileErrorMiddleware,
    endContext,
    resourceMiddleware,
    startContext,
    staticMiddleware,
    templateMiddleware
} from '@talon/compiler';
import compression from 'compression';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import uuidv4 from 'uuidv4';
import colors from 'colors';
import fs from 'fs-extra';
import { Parser } from 'xml2js';
import mimeTypes from 'mime-types';
import debugLogger from 'debug';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import { apexMiddleware } from './apexMiddleware';
import { Connection } from '@salesforce/core';
import reload from 'reload';
import chokidar from 'chokidar';
import getPort from 'get-port';
import EventEmitter from 'events';

const PUBLIC_DIR = 'public';

const debug = debugLogger('localdevserver');
const { log } = console;

const FRAMEWORK_RESOURCE_JSON = require.resolve(
    '@talon/framework/dist/resources.json'
);
const FRAMEWORK_OUTPUT_DIR = path.dirname(FRAMEWORK_RESOURCE_JSON);

let watcher: chokidar.FSWatcher;
let _RELOAD_RETURNED = { reload: () => {}, closeServer: async () => {} };

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

export async function createServer(
    options: any,
    apiConfig: any = {},
    connection?: Connection
) {
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

    const emitter = new EventEmitter();
    app.use(resourceEmiter(emitter));

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
    app.use(staticMiddleware());

    if (connection) {
        app.use(
            apexMiddleware({
                instanceUrl: connection.instanceUrl,
                accessToken: connection.accessToken
            })
        );
    }

    if (options.liveReload) {
        debug('Setting up filewatcher');

        // reload - auto reloading of the page
        let reloading: { [key: string]: boolean } = {};
        const liveReloadPort = await getPort();
        debug('live reload port: ' + liveReloadPort);
        const reloadReturned = await reload(app, {
            port: liveReloadPort,
            verbose: debugLogger.enabled('localdevserver')
        });
        _RELOAD_RETURNED = reloadReturned;
        debug('watching: ' + sourceDir);
        const ignored = outputDir + '/**';
        watcher = chokidar.watch(sourceDir, {
            ignored
        });
        watcher.on('change', fileName => {
            const name = path.parse(fileName).name;
            debug(`file changed: ${name}`);
            if (!reloading[name]) {
                reloading[name] = true;

                debug(`reloading ${name}...`);
                _RELOAD_RETURNED.reload();
                let reloadLoop = setTimeout(() => {
                    debug(`retrying reload ${name}...`);
                    _RELOAD_RETURNED.reload();
                }, 500);
                // wait until we get back a resource request

                const ackListener = (args: string) => {
                    // can't listen for the name of the file that was changed, since
                    // it might be bundled into another high level component, so
                    // just listen for any request
                    // if (args.indexOf(name) != -1) {
                    debug(`Reload complete ${name}`);
                    reloading[name] = false;
                    emitter.off('resourceUrl', ackListener);
                    clearTimeout(reloadLoop);
                    // }
                };
                emitter.on('resourceUrl', ackListener);
            }
        });
        debug('Waiting for watcher');
        // await new Promise(resolve => {
        //     watcher.on('ready', resolve);
        // });
        debug('Watcher is ready');
    }

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

export function resourceEmiter(emitter: EventEmitter) {
    return async function(req: Request, res: Response, next: NextFunction) {
        emitter.emit('resourceUrl', req.url);
        next();
    };
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

    server.on('close', async () => {
        endContext();
        await _RELOAD_RETURNED.closeServer();
        watcher.close();
    });

    process.on('SIGINT', async () => {
        server.close();
        process.exit();
    });

    return server;
}

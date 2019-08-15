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
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import uuidv4 from 'uuidv4';
import colors from 'colors';
import fs from 'fs-extra';
import xmlParser from 'fast-xml-parser';
import mimeTypes from 'mime-types';
import debugLogger from 'debug';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import { apexMiddleware } from './apexMiddleware';
import { Connection } from '@salesforce/core';
import reload from 'reload';
import watch from 'watch';
import getPort from 'get-port';

const PUBLIC_DIR = 'public';

const debug = debugLogger('localdevserver');
const { log } = console;

const FRAMEWORK_RESOURCE_JSON = require.resolve(
    '@talon/framework/dist/resources.json'
);
const FRAMEWORK_OUTPUT_DIR = path.dirname(FRAMEWORK_RESOURCE_JSON);

const _WATCHTREE_FOLDERS: Array<string> = [];
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
            if (fs.existsSync(xmlFileName)) {
                const data = fs.readFileSync(xmlFileName, 'utf8');
                const result = xmlParser.parse(data);
                // Parse the xml into json
                if (result) {
                    const contentType = result.StaticResource.contentType[0];
                    const fileExt = mimeTypes.extension(contentType);
                    // Tack on the file extension and send it through
                    req.url = req.url + '.' + fileExt;
                    next('route');
                }
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
        // reload - auto reloading of the page
        let reloading: { [key: string]: boolean } = {};
        const liveReloadPort = await getPort();
        debug('live reload port: ' + liveReloadPort);
        reload(app, {
            port: liveReloadPort,
            verbose: debugLogger.enabled('localdevserver')
        }).then((reloadReturned: any) => {
            _RELOAD_RETURNED = reloadReturned;
            _WATCHTREE_FOLDERS.push(sourceDir);
            debug('watching: ' + sourceDir);
            const ignoreDirectoryPattern = new RegExp(outputDir + '.*');
            const watchCallback = function(file: any, curr: any, prev: any) {
                if (typeof file === 'string') {
                    const fileName: string = file.toString();
                    debug('file changed: ' + fileName);
                    if (!reloading[fileName]) {
                        reloading[fileName] = true;
                        _RELOAD_RETURNED.reload();
                        setTimeout(() => {
                            reloading[fileName] = false;
                        }, 500);
                    }
                    if (
                        fs.existsSync(fileName) &&
                        fs.lstatSync(fileName).isDirectory()
                    ) {
                        debug('new folder, now watching: ' + fileName);
                        watch.watchTree(
                            fileName,
                            { ignoreDirectoryPattern },
                            watchCallback
                        );
                        _WATCHTREE_FOLDERS.push(fileName);
                    } else if (_WATCHTREE_FOLDERS.indexOf(fileName) !== -1) {
                        _WATCHTREE_FOLDERS.splice(
                            _WATCHTREE_FOLDERS.indexOf(fileName),
                            1
                        );
                    }
                }
            };
            watch.watchTree(
                sourceDir,
                { ignoreDirectoryPattern },
                watchCallback
            );
        });
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
        _WATCHTREE_FOLDERS.forEach(watch.unwatchTree);
    });

    process.on('SIGINT', async () => {
        server.close();
        process.exit();
    });

    return server;
}

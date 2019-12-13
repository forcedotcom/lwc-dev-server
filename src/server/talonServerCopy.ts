/*
 * Essentially a copy of @webruntime/compiler/src/server/server.js
 * Splits the run method into createServer / startServer methods.
 * Ideally we can move this back into webruntime once we determine how best
 * to expose webruntime's express server for configuration
 *
 */
import {
    apiMiddleware,
    compileErrorMiddleware,
    resourceMiddleware,
    contextService,
    staticMiddleware,
    templateMiddleware
} from '@webruntime/compiler';
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
import minimatch from 'minimatch';

const PUBLIC_DIR = 'public';

const debug = debugLogger('localdevserver');

const FRAMEWORK_RESOURCE_JSON = require.resolve(
    '@webruntime/framework/dist/resources.json'
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
 * const { FRAMEWORK_PUBLIC_DIR } = require('@webruntime/compiler');
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

export function getRootApp(app: any, basePath: string) {
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
    const {
        templateDir,
        outputDir,
        basePath,
        srcDir
    } = await contextService.startContext(options);
    const sourceDir = path.resolve(srcDir);
    const app = express();

    // 0. GZIP all assets
    app.use(compression());

    // 1. CSP for script-src directive
    app.use(cspNonceMiddleware());
    app.use(cspPolicyMiddleware());

    // 2. Setup CSRF Token
    app.use(cookieParser());
    app.use(csurf({ cookie: true }));

    // 2. resource middleware, compile component or views if needed and redirect to the generated resource
    app.use(resourceMiddleware());

    // 3. Serve up static files
    // handle Salesforce static resource imported using @salesforce/resourceUrl/<resourceName>
    // remove versionKey from resourceURL and forward the request
    app.get(`/assets/:versionKey/*`, salesforceStaticAssetsRoute(basePath));

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
        await startLiveReload(app, sourceDir, outputDir, templateDir);
    }

    // Proxy, record and replay API calls
    app.use(apiMiddleware(apiConfig));

    return app;
}

export async function startServer(
    app: any,
    basePath: string,
    port = 3000,
    onClose = () => {}
) {
    // If none found, serve up the page for the current route depending on the path
    app.get(`${basePath}/*`, templateMiddleware());

    // Error handling
    app.use(compileErrorMiddleware());

    // Start the server
    const server = getRootApp(app, basePath).listen(port, () => {
        console.log(
            colors.magenta.bold(
                `Server up on http://localhost:${
                    server.address().port
                }${basePath}`
            )
        );
    });

    server.on('close', async () => {
        contextService.endContext();
        if (_RELOAD_RETURNED) {
            await _RELOAD_RETURNED.closeServer();
        }
        _WATCHTREE_FOLDERS.forEach(watch.unwatchTree);
        onClose();
    });

    process.on('SIGINT', async () => {
        server.close();
        process.exit();
    });

    return server;
}

/**
 * Create the CSP Nonce Middleware that adds a uuid to every request.
 * We use this for adding to the CSP policy.
 *
 */
export function cspNonceMiddleware() {
    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        res.locals.nonce = uuidv4();
        next();
    };
}

/**
 * Generate the CSP policy for the request.
 * Eventually we'll want this matching what Locker Service provides.
 */
export function cspPolicyMiddleware() {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                scriptSrc: [
                    `'self'`,
                    (req: express.Request, res: express.Response) =>
                        `'nonce-${res.locals.nonce}'`
                ]
            }
        }
    });
}

/**
 * Route handler for /assets/:versionKey/*
 * This loads handles SLDS and Static Resources in the project
 *
 * @param basePath Server root server path to locate the assets.
 */
export function salesforceStaticAssetsRoute(basePath: string) {
    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        // Ignore for our SLDS routes
        debug(req.url);

        // Weird edge case where file extension isn't included for staticresource resolution
        // except when the resource is part of an application/zip. Examples from lwc-recipes:
        // libsD3 - resolution works properly because its metadata contentType is <contentType>application/zip</contentType>
        // libsChartjs - resolution fails because its metadata contentType is <contentType>application/javascript</contentType>
        if (req.url.indexOf('.') === -1) {
            req.url = `${basePath}/assets/${req.params[0]}`;
            const xmlFileName =
                '.localdevserver/public' + req.url + '.resource-meta.xml';
            // Let's try to grab the file extension from the metadata.xml file
            if (fs.existsSync(xmlFileName)) {
                const data = fs.readFileSync(xmlFileName, 'utf8');
                const result = xmlParser.parse(data);
                // Parse the xml into json
                if (result) {
                    const contentType = result.StaticResource.contentType;
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
                req.url.indexOf('/assets/icons/') === -1 &&
                req.url.indexOf('/assets/images/')
            ) {
                req.url = `${basePath}/assets/${req.params[0]}`;
                next('route');
            } else {
                next();
            }
        }
    };
}

/**
 * Starts watching for changes to files and performs live reloads.
 *
 * @param app Express application
 * @param sourceDir Directory to listen for changes
 * @param outputDir We ignore changes to the output directory. Otherwise we could ge tin a loop.
 */
export async function startLiveReload(
    app: express.Application,
    sourceDir: string,
    outputDir: string,
    templateDir: string
) {
    // reload - auto reloading of the page
    const reloading: { [key: string]: boolean } = {};
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
            // ignore the initial invoke of the callback
            // - the initial invoke returns an object with every file in the tree.
            // - all other invokes return the path of the modified file.
            if (typeof file === 'object' && prev === null && curr === null) {
                return;
            }

            // filepath expected from first argument
            if (typeof file !== 'string') {
                return;
            }

            debug('file changed: ' + file);

            const forceIgnorePatterns = loadIgnorePatterns(
                path.join(templateDir, '.forceignore')
            );

            // exit early if the updated file matches a force ignore pattern
            for (const ignorePattern of forceIgnorePatterns) {
                if (minimatch(file, ignorePattern)) {
                    return;
                }
            }

            if (!reloading[file]) {
                reloading[file] = true;
                _RELOAD_RETURNED.reload();
                setTimeout(() => {
                    reloading[file] = false;
                }, 500);
            }
            if (fs.existsSync(file) && fs.lstatSync(file).isDirectory()) {
                debug('new folder, now watching: ' + file);
                watch.watchTree(
                    file,
                    { ignoreDirectoryPattern },
                    watchCallback
                );
                _WATCHTREE_FOLDERS.push(file);
            } else if (_WATCHTREE_FOLDERS.indexOf(file) !== -1) {
                _WATCHTREE_FOLDERS.splice(_WATCHTREE_FOLDERS.indexOf(file), 1);
            }
        };
        watch.watchTree(sourceDir, { ignoreDirectoryPattern }, watchCallback);
    });
}

function loadIgnorePatterns(filepath: string) {
    if (!fs.existsSync(filepath) || !fs.lstatSync(filepath).isFile()) {
        return [];
    }
    return fs
        .readFileSync(filepath)
        .toString()
        .split('\n')
        .filter(value => value.length > 0 && value.trim()[0] != '#');
}

import fs from 'fs';
import path from 'path';
import cpx from 'cpx';
import express from 'express';
import uuidv4 from 'uuidv4';
import { createServer, startServer } from './talonServerCopy';
import Project from '../common/Project';
import ComponentIndex from '../common/ComponentIndex';
import { webruntimeConfig, views, theme, routes } from './webruntimeConfig';
import { copyFiles, removeFile } from '../common/fileUtils';
import { customComponentPlugin } from './config/rollup-plugin-custom-components';
import salesforceApexWireResolver from './config/rollup-plugin-salesforce-apex';
import labelResolver from './labelResolver';
import debugLogger from 'debug';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import { Server } from 'http';
import { Connection } from '@salesforce/core';
import { performance } from 'perf_hooks';
import LocalDevTelemetryReporter from '../instrumentation/LocalDevTelemetryReporter';
import crypto from 'crypto';

const debug = debugLogger('localdevserver');
const packageRoot = path.join(__dirname, '..', '..');
const DEFAULT_API_VERSION = '46.0';

const ALLOWED_SHOW_EXTENSIONS: { [key: string]: boolean } = {
    '.html': true,
    '.css': true,
    '.js': true
};

export const defaultOutputDirectory = '.localdevserver';

export default class LocalDevServer {
    private server?: Server;
    private readonly nonce: string;
    private readonly devhubUser: string;

    /**
     * A unique ID that maps to the user that is operating local development.
     * It has no information you can map back to the actual user,
     */
    private readonly anonymousUserId: string;

    /**
     * Initializes properties for the LocalDevServer
     *
     * @param devhubUser By providing a devhubUser we can provide instrumentation for a unique user. Otherwise they all get bucketed into one user.
     */
    constructor(devhubUser?: string) {
        this.devhubUser = devhubUser || '';
        this.anonymousUserId = devhubUser
            ? crypto
                  .createHash('md5')
                  .update(this.devhubUser)
                  .digest('hex')
            : '';
        this.nonce = uuidv4();
    }

    public async start(project: Project, connection?: Connection) {
        const startTime = performance.now();

        const configuration: LocalDevServerConfiguration =
            project.configuration;

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the webruntime compiler
        // expects the directory name to be the namespace passed to the
        // descriptor.
        const directory = project.directory;

        // the regular node_module paths
        const nodePaths = require.resolve.paths('.') || [];

        // Salesforce internal version == Salesforce API Version * 2 + 128
        // 45 * 2 + 128 = 218
        const version =
            configuration.api_version !== undefined
                ? parseInt(configuration.api_version, 10) * 2 + 128
                : 0;

        // vendor deps that we override, like LGC, LDS, etc
        const vendors = path.resolve(
            path.join(
                require.resolve('@salesforce/lwc-dev-server-dependencies'),
                '..', // above resolve includes index.js
                'vendors',
                `dependencies-${version}`
            )
        );

        // our own lwc modules to host the local app
        const localDependencies = packageRoot;

        // Reporter for instrumentation
        const reporter = await LocalDevTelemetryReporter.getInstance(
            this.anonymousUserId,
            this.nonce
        );

        // all the deps, filtered by existing
        let modulePaths = [vendors, localDependencies, ...nodePaths];

        if (version === 222) {
            // Use 218 version of LDS temporarily
            // Its the only thing in this 218 directory, so the rest will come from 220 dependencies
            modulePaths.unshift(
                path.resolve(
                    path.join(
                        require.resolve(
                            '@salesforce/lwc-dev-server-dependencies'
                        ),
                        '..', // above resolve includes index.js
                        'vendors',
                        `dependencies-218`
                    )
                )
            );
        }

        modulePaths = modulePaths.filter(fs.existsSync);

        try {
            if (project.isSfdx) {
                webruntimeConfig.rollup.plugins.push(
                    customComponentPlugin(
                        configuration.namespace,
                        'lwc',
                        project.directory
                    )
                );
            }

            webruntimeConfig.rollup.plugins.push(salesforceApexWireResolver());

            const resolver = labelResolver({
                customLabelsPath: project.customLabelsPath
            });
            const labels = resolver.createProxiedObject();

            const config = {
                templateDir: directory,
                webruntimeConfig,
                srcDir: project.modulesSourceDirectory,
                views,
                partials: { nonce: this.nonce },
                indexHtml: path.join(__dirname, '..', 'html', 'index.html'),
                routes,
                labels,
                theme,
                outputDir: path.join(directory, defaultOutputDirectory),
                locale: 'en_US',
                basePath: '',
                isPreview: false,
                modulePaths,
                runInBand: true,
                liveReload: configuration.liveReload,
                modes: ['dev']
            };

            debug('Running Universal Container with config:');
            debug(config);

            // fixme: clear outputDir for now because of a caching issue
            // with webruntime (maybe we need to force a recompile of the views?)
            removeFile(config.outputDir);
            debug('cleared outputDirectory');

            await this.copyAssets(project, config.outputDir);

            const proxyConfig = {
                apiEndpoint: configuration.endpoint,
                recordApiCalls: false,
                onProxyReq: configuration.onProxyReq,
                pathRewrite: this.pathRewrite(
                    configuration.api_version || DEFAULT_API_VERSION
                )
            };

            // Start the webruntime site.
            const server = await createServer(config, proxyConfig, connection);

            server.get(
                `/localdev/${this.nonce}/localdev.json`,
                (
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction
                ) => {
                    const componentIndex = new ComponentIndex(project);
                    const json = componentIndex.getProjectMetadata();
                    res.json(json);
                }
            );

            server.get(
                `/localdev/${this.nonce}/localdev.js`,
                (
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction
                ) => {
                    const componentIndex = new ComponentIndex(project);
                    const json = componentIndex.getProjectMetadata();
                    const LocalDev = {
                        project: json
                    };
                    res.type('js');
                    res.send(`window.LocalDev = ${JSON.stringify(LocalDev)};`);
                }
            );

            server.get(
                `/localdev/${this.nonce}/show`,
                (
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction
                ) => {
                    const file = req.query.file;
                    const extension = path.extname(file);
                    const normalizedFile = path.normalize(file);
                    if (
                        normalizedFile.startsWith(
                            path.normalize(project.modulesSourceDirectory)
                        ) &&
                        ALLOWED_SHOW_EXTENSIONS[extension]
                    ) {
                        res.sendFile(file);
                    }
                }
            );

            this.server = await startServer(
                server,
                '',
                configuration.port,
                () => {
                    const runtimeDuration = performance.now() - startTime;
                    // After the application has ended.
                    // Report how long the server was opened.
                    reporter.trackApplicationEnd(runtimeDuration);
                }
            );

            const startDuration = performance.now() - startTime;

            reporter.trackApplicationStart(
                startDuration,
                false,
                version.toString()
            );
        } catch (e) {
            reporter.trackApplicationStartException(e);

            throw new Error(`Unable to start LocalDevServer: ${e}`);
        }
    }

    public async stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close(err => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    public get port() {
        if (this.server) {
            const address = this.server.address();
            if (address != null && typeof address !== 'string') {
                return address.port;
            }
        }
    }

    protected async copyAssets(project: Project, dest: string) {
        const distPath = path.join(packageRoot, 'dist');
        const assetsPath = path.join(dest, 'public', 'assets');

        try {
            copyFiles(path.join(distPath, 'assets', '*'), assetsPath);
        } catch (e) {
            throw new Error(`error - unable to copy assets: ${e}`);
        }

        // Copy and watch these files
        this.watchAssets(project, assetsPath);
    }

    private async watchAssets(project: Project, assetDir: string) {
        let staticDir = project.staticResourcesDirectory;
        if (staticDir !== null && fs.existsSync(staticDir)) {
            staticDir = path.join(staticDir, '**', '*');
            await cpx.copy(staticDir, assetDir);
            // TODO just copy for now
            //cpx.watch(staticDir, assetDir);
        }
    }

    protected pathRewrite(version: string): Function {
        return (localPath: string) => {
            let retVal = localPath;
            // Strip /api if we start with api
            if (retVal.startsWith('/api/')) {
                retVal = retVal.substring(4);
            }
            retVal = retVal.replace(/v[\d]*\.0/, `v${version}`);

            return retVal;
        };
    }
}

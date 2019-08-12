import fs from 'fs';
import path from 'path';
import cpx from 'cpx';
import { createServer, startServer } from './talonServerCopy';
import Project from '../common/Project';
import ComponentIndex from '../common/ComponentIndex';
import { talonConfig, views, labels, theme, routes } from './talonConfig';
import { copyFiles, removeFile } from '../common/fileUtils';
import { customComponentPlugin } from './config/rollup-plugin-custom-components';
import {
    PRECOMPILED_PREFIX,
    precompiled
} from './config/rollup-plugin-precompiled';
import debugLogger from 'debug';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import { Server } from 'http';
import { Connection } from '@salesforce/core';

const debug = debugLogger('localdevserver');
const packageRoot = path.join(__dirname, '..', '..');
const DEFAULT_API_VERSION = '45.0';

export const defaultOutputDirectory = '.localdevserver';

export default class LocalDevServer {
    private server?: Server;

    public async start(project: Project, connection?: Connection) {
        const configuration: LocalDevServerConfiguration =
            project.configuration;

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the talon compiler
        // expects the directory name to be the namespace passed to the
        // descriptor.
        const directory = project.directory;

        // the regular node_module paths
        const nodePaths = require.resolve.paths('.') || [];

        // Salesforce internal version == Salesforce API Version * 2 + 128
        // 45 * 2 + 128 = 218
        let version =
            configuration.api_version !== undefined
                ? parseInt(configuration.api_version, 10) * 2 + 128
                : 0;
        debug(
            `API Version ${configuration.api_version}, internal version ${version}`
        );
        // vendor deps that we override, like LGC, LDS, etc
        const extraDependencies: any = [];

        // our own lwc modules to host the local app
        const localDependencies = packageRoot;

        // all the deps, filtered by existing
        let modulePaths = [
            extraDependencies,
            localDependencies,
            ...nodePaths
        ].filter(fs.existsSync);

        if (project.isSfdx) {
            talonConfig.rollup.plugins.push(
                customComponentPlugin(
                    configuration.namespace,
                    'lwc',
                    project.directory
                )
            );
        }

        const precompiledLoaderPlugin = await precompiled({
            apiVersion: version
        });
        talonConfig.rollup.plugins.push(precompiledLoaderPlugin);
        talonConfig.lwcOptions = {
            exclude: [
                '/**/*.mjs',
                // Salesforce scoped modules (schema, apex, etc.) do not
                // need to go through the LWC rollup plugin
                /@salesforce\/.*/,
                `${PRECOMPILED_PREFIX}**`
            ]
        };
        const config = {
            templateDir: directory,
            talonConfig,
            srcDir: project.modulesSourceDirectory,
            views,
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
        debug(JSON.stringify(config, null, 4));

        // fixme: clear outputDir for now because of a caching issue
        // with talon (maybe we need to force a recompile of the views?)
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

        try {
            // Start the talon site.
            const server = await createServer(config, proxyConfig, connection);
            server.use('/componentList', function(
                req: any,
                res: any,
                next: () => void
            ) {
                const tmp = new ComponentIndex(project);
                const modules = tmp.getModules();
                res.json(modules);
            });
            this.server = await startServer(server, '', configuration.port);
        } catch (e) {
            throw new Error(`Unable to start LocalDevServer: ${e}`);
        }
    }

    public async stop() {
        if (this.server) {
            this.server.close();
        }
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

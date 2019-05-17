import fs from 'fs';
import path from 'path';
import cpx from 'cpx';
import { createServer, startServer } from './talonServerCopy';
import Project from '../common/Project';
import ComponentIndex from '../common/ComponentIndex';
import { talonConfig, views, labels, theme, routes } from './talonConfig';
import { copyFiles, removeFile } from '../common/fileUtils';
import { customComponentPlugin } from './config/rollup-plugin-custom-components';
import SfdxConfiguration from '../user/SfdxConfiguration';
import debugLogger from 'debug';

const debug = debugLogger('localdevserver');

export const defaultOutputDirectory = '.localdevserver';
const packageRoot = path.join(__dirname, '..', '..');

export default class LocalDevServer {
    public async start(project: Project) {
        const sfdxConfig: SfdxConfiguration = project.getSfdxConfiguration();

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the talon compiler
        // expects the directory name to be the namespace passed to the
        // descriptor.
        const directory = sfdxConfig.getPath();

        // the regular node_module paths
        const nodePaths = require.resolve.paths('.') || [];

        // Salesforce internal version == Salesforce API Version * 2 + 128
        // 45 * 2 + 128 = 218
        const version = parseInt(sfdxConfig.api_version, 10) * 2 + 128;

        // vendor deps that we override, like LGC, LDS, etc
        const extraDependencies = path.resolve(
            path.join(packageRoot, 'vendors', `dependencies-${version}`)
        );

        // our own lwc modules to host the local app
        const localDependencies = packageRoot;

        // all the deps, filtered by existing
        let modulePaths = [
            extraDependencies,
            localDependencies,
            ...nodePaths
        ].filter(fs.existsSync);

        if (project.isSfdx()) {
            talonConfig.rollup.plugins.push(
                customComponentPlugin(
                    sfdxConfig.namespace,
                    'lwc',
                    sfdxConfig.getPath()
                )
            );
        }

        const config = {
            templateDir: directory,
            talonConfig,
            srcDir: project.getModuleSourceDirectory(),
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
            modes: ['dev']
        };

        debug('Running Universal Container with config:');
        debug(config);

        // fixme: clear outputDir for now because of a caching issue
        // with talon (maybe we need to force a recompile of the views?)
        removeFile(config.outputDir);
        debug('cleared outputDirectory');

        await this.copyAssets(project, config.outputDir);

        const proxyConfig = {
            apiEndpoint: sfdxConfig.endpoint,
            recordApiCalls: false,
            onProxyReq: sfdxConfig.onProxyReq,
            pathRewrite: this.pathRewrite
        };

        try {
            // Start the talon site.
            const server = await createServer(config, proxyConfig);
            server.use('/componentList', function(
                req: any,
                res: any,
                next: () => void
            ) {
                const tmp = new ComponentIndex(project);
                const modules = tmp.getModules();
                res.json(modules);
            });
            await startServer(server, '', project.getConfiguration().port);
        } catch (e) {
            throw new Error(`Unable to start LocalDevServer: ${e}`);
        }
    }

    private async copyAssets(project: Project, dest: string) {
        const distPath = path.join(packageRoot, 'dist');
        const assetsPath = path.join(dest, 'public', 'assets');

        try {
            copyFiles(`${distPath}/assets/*`, assetsPath);
        } catch (e) {
            throw new Error(`error - unable to copy assets: ${e}`);
        }

        // Copy and watch these files
        this.watchAssets(project, assetsPath);
    }

    private async watchAssets(project: Project, assetDir: string) {
        let staticDir = project.getStaticResourcesDirectory();
        if (staticDir !== null && fs.existsSync(staticDir)) {
            staticDir = path.join(staticDir, '**', '*');
            await cpx.copy(staticDir, assetDir);
            // TODO just copy for now
            //cpx.watch(staticDir, assetDir);
        }
    }

    private pathRewrite(localPath: string) {
        let retVal = localPath;
        // Strip /api if we start with api
        if (retVal.startsWith('/api/')) {
            retVal = retVal.substring(4);
        }

        // hardcode our api version for now
        retVal = retVal.replace('v47.0', 'v45.0');
        retVal = retVal.replace('v46.0', 'v45.0');

        return retVal;
    }
}
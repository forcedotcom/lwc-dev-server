import fs from 'fs';
import path from 'path';
import cpx from 'cpx';
import { rm } from 'shelljs';
import { createServer, startServer } from './talonServerCopy';
import Project from '../common/Project';
import ComponentIndex from '../common/ComponentIndex';
import { talonConfig, views, labels, theme, routes } from './talonConfig';
import { copyFiles } from '../common/fileUtils.ts';

export default class LocalDevServer {
    public async start(project: Project) {
        // Okay in this directory lets do the following things.

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the talon compiler expects the directory name to be the namespace passed
        // to the descriptor.
        const directory = project.getSfdxConfiguration().getPath();
        // the regular node_module paths
        const nodePaths = require.resolve.paths('.') || [];

        // Salesforce internal version == Salesforce API Version * 2 + 128
        // 45 * 2 + 128 = 218
        const version =
            parseInt(project.getSfdxConfiguration().api_version, 10) * 2 + 128;
        // vendor deps that we override, like LGC, LDS, etc
        const extraDependencies = path.resolve(
            path.join(__dirname, '..', 'vendors', `dependencies-${version}`)
        );
        // our own lwc modules to host the local app
        const localDependencies = path.resolve(__dirname, '..', '..');

        // all the deps, filtered by existing
        let modulePaths = [
            extraDependencies,
            localDependencies,
            ...nodePaths
        ].filter(fs.existsSync);

        const config = {
            templateDir: directory,
            talonConfig,
            srcDir: project.getModuleSourceDirectory(),
            views,
            indexHtml: path.join(__dirname, '..', 'config', 'index.html'),
            routes,
            labels,
            theme,
            outputDir: `${directory}/.localdevserver`,
            locale: `en_US`,
            basePath: ``,
            isPreview: false,
            modulePaths,
            modes: ['dev']
        };

        console.log('Running Universal Container with config:');
        console.dir(config);

        // fixme: clear outputDir for now because of a caching issue
        // with talon (maybe we need to force a recompile of the views?)
        if (fs.existsSync(config.outputDir)) {
            rm('-rf', config.outputDir);
            console.log('cleared output dir');
        }

        await this.copyAssets(project, config.outputDir);

        const proxyConfig = {
            apiEndpoint: project.getSfdxConfiguration().endpoint,
            recordApiCalls: false,
            onProxyReq: project.getSfdxConfiguration().onProxyReq,
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
        const distPath = path.join(__dirname, '..', '..', 'dist');
        const assetsPath = path.join(dest, 'public', 'assets');
        copyFiles(`${distPath}/assets/*`, assetsPath);

        // Copy and watch these files
        // this.watchAssets(project, assetsPath);
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

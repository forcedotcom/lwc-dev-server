import fs from 'fs';
import path from 'path';
import cpx from 'cpx';
import mkdirp from 'mkdirp';
import {
    startContext,
    endContext
} from '@talon/compiler/src/context/context-service';
import metadataService from '@talon/compiler/src/metadata/metadata-service';
import resourceService from '@talon/compiler/src/resources/resource-service';
import validate from '@talon/compiler/src/metadata/metadata-validation';
import { createServer, startServer } from './talonServerCopy';
import Project from './common/Project';
import rimraf from 'rimraf';
import ComponentIndex from './common/ComponentIndex';

const talonConfig = {
    includeLwcModules: ['force/lds', 'force/salesforceScopedModuleResolver']
};

const routes = [
    {
        name: 'home',
        path: '/',
        isRoot: true,
        view: 'home',
        label: 'Home'
    },
    {
        name: 'preview',
        path: '/lwc/preview/:cmp*',
        isRoot: false,
        view: 'preview',
        label: 'LWC Preview'
    }
];
const labels = {};
const theme = {
    name: 'duck',
    label: 'Duck Burrito',
    themeLayouts: {
        main: {
            view: 'mainLayout'
        }
    }
};
const views = {
    home: {
        name: 'home',
        label: 'Home',
        themeLayoutType: 'main',
        component: {
            name: 'localdevserver/home',
            regions: []
        }
    },
    mainLayout: {
        name: 'mainLayout',
        label: 'Default Layout',
        component: {
            name: 'localdevserver/layout',
            regions: [
                {
                    name: 'header',
                    label: 'Header',
                    components: []
                },
                {
                    name: 'footer',
                    label: 'Footer',
                    components: []
                }
            ]
        }
    },
    preview: {
        name: 'preview',
        label: 'LWC Preview',
        themeLayoutType: 'main',
        component: {
            name: 'localdevserver/preview',
            attributes: {
                cmp: '{!cmp}'
            }
        }
    }
};

export default class LocalDevServer {
    public build() {}

    public async start(project: Project, entryPoint: string) {
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
            indexHtml: path.join(__dirname, 'config', 'index.html'),
            routes,
            labels,
            theme,
            outputDir: `${directory}/.localdevserver`,
            locale: `en_US`,
            basePath: ``,
            //            watchPath:
            //                '~/git/duckburrito/local-dev-tools/packages/local-dev-modules/src/modules/localdevserver',
            isPreview: false,
            modulePaths,
            modes: ['dev']
        };
        const descriptor = `component://${entryPoint}@en`;
        console.log('Running Universal Container with config:');
        console.dir(config);

        // fixme: clear outputDir for now because of a caching issue
        // with talon (maybe we need to force a recompile of the views?)
        if (fs.existsSync(config.outputDir)) {
            rimraf.sync(config.outputDir);
            console.log('cleared output dir');
        }

        await this.copyAssets(config.outputDir);

        const proxyConfig = {
            apiEndpoint: project.getSfdxConfiguration().endpoint,
            recordApiCalls: false,
            onProxyReq: project.getSfdxConfiguration().onProxyReq
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
            console.error(e);
            process.exit(0);
        }
    }

    public async copyAssets(dest: string) {
        const assetsDir = path.join(dest, 'public', 'assets');

        mkdirp.sync(assetsDir);

        // Copy Slds
        // Whats the right thing to do here though?
        this.copy(
            'node_modules/@salesforce-ux/design-system/assets/**/symbols.svg',
            assetsDir
        );
        this.copy(
            'node_modules/@salesforce-ux/design-system/assets/**/*.{woff2,css}',
            assetsDir
        );

        // Favicon
        // Prevents an exception in raptor code when requesting a file that doesn't exist.
        this.copy('src/assets/favicon.ico', assetsDir);
    }

    private copy(src: string, dest: string) {
        cpx.copy(path.join(__dirname, '..', src), dest, (e: Error) => {
            if (e === undefined || e === null) {
                console.log(`Done copying ${src} to ${dest}`);
            } else {
                console.error(`Error copying ${src} to ${dest}: ${e}`);
            }
        });
    }
}

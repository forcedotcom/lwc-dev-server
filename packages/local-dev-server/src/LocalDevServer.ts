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
import { run } from '@talon/compiler/src/server/server';
import Project from './common/Project';
import rimraf from 'rimraf';

const talonConfigJson = {};

const routesJson = [
    {
        name: 'home',
        path: '/',
        isRoot: true,
        view: 'home',
        label: 'Home'
    },
    {
        name: 'preview',
        path: '/lwc/preview',
        isRoot: false,
        view: 'preview',
        label: 'LWC Preview'
    }
];
const labelsJson = {};
const themeJson = {
    name: 'duck',
    label: 'Duck Burrito',
    themeLayouts: {
        main: {
            view: 'mainLayout'
        }
    }
};
const viewsDir = {
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
            regions: [
                {
                    name: 'entryPoint',
                    label: 'entryPoint',
                    components: [
                        {
                            name: ''
                        }
                    ]
                }
            ]
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
        const directory = project.getDirectory();

        const config = {
            templateDir: directory,
            talonConfigJson,
            srcDir: project.getModuleSourceDirectory(),
            viewsDir,
            indexHtml: path.join(__dirname, 'config', 'index.html'),
            routesJson,
            labelsJson,
            themeJson,
            outputDir: `${directory}/.localdevserver`,
            locale: `en_US`,
            basePath: ``,
            isPreview: false
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

        await this.updatePreviewView(config.viewsDir.preview, entryPoint);

        try {
            // Start the talon site.
            await run(
                config,
                project.getConfiguration().getHostPort(),
                '' /*apiEndpoint*/,
                true /*recordApiCalls*/
            );
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
            '../../node_modules/@salesforce-ux/design-system/assets/**/symbols.svg',
            assetsDir
        );
        this.copy(
            '../../node_modules/@salesforce-ux/design-system/assets/**/*.{woff2,css}',
            assetsDir
        );

        // Favicon
        // Prevents an exception in raptor code when requesting a file that doesn't exist.
        this.copy('src/assets/favicon.ico', assetsDir);
    }

    private async updatePreviewView(viewJson: any, main: string) {
        viewJson.component.regions[0].components[0].name = main;
    }

    private async compile(config: any, descriptor: string) {
        // const t0 = performance.now();

        // valdiates metdata, we definately don't need this
        // await validate();

        // we really need a descriptor
        if (descriptor) {
            try {
                await startContext(config);
                const staticResource = await resourceService.get(descriptor);
                console.log(`Done. Received`);
                console.dir(staticResource);
            } catch (err) {
                console.error(err.stack || err.message || err);
            } finally {
                // We obviously should keep this open till we kill the process
                endContext();
            }
        }
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

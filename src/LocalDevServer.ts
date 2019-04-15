import path from 'path';
import colors from 'colors';
import cpx from 'cpx';
import mkdirp from 'mkdirp';

//import performance from 'perf_hooks';
import {
    startContext,
    endContext,
    getContext
} from '@talon/compiler/src/context/context-service';
import metadataService from '@talon/compiler/src/metadata/metadata-service';
import resourceService from '@talon/compiler/src/resources/resource-service';
import validate from '@talon/compiler/src/metadata/metadata-validation';
import { run } from '@talon/compiler/src/server/server';

export default class LocalDevServer {
    public install(directory: string) {
        const assetsDir = path.join(directory, 'dist', 'public', 'assets');

        mkdirp.sync(assetsDir);

        // Copy Slds
        // Whats the right thing to do here though?
        this.copyStaticAsset(
            'node_modules/@salesforce-ux/design-system/assets/**/symbols.svg',
            assetsDir
        );
        this.copyStaticAsset(
            'node_modules/@salesforce-ux/design-system/assets/**/*.{woff2,css}',
            assetsDir
        );
        this.copyStaticAsset('src/assets/favicon.ico', assetsDir);
    }

    public build() {}

    public async start(entryPoint: string, directory: string) {
        // Okay in this directory lets do the following things.

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the talon compiler expects the directory name to be the namespace passed
        // to the descriptor.

        const config = {
            templateDir: directory,
            talonConfigJson: path.join(
                __dirname,
                'config',
                'talon.config.json'
            ),
            srcDir: `${directory}/src`,
            viewsDir: path.join(__dirname, 'config', 'views'),
            indexHtml: path.join(__dirname, 'config', 'index.html'),
            routesJson: path.join(__dirname, 'config', 'routes.json'),
            labelsJson: path.join(__dirname, 'config', 'labels.json'),
            themeJson: path.join(__dirname, 'config', 'theme.json'),
            outputDir: `${directory}/dist`,
            locale: `en_US`,
            basePath: ``,
            isPreview: false
        };
        const descriptor = `component://${entryPoint}@en`;

        // Pass that to the Talon compiler.

        // Uhhh.... this is apparently totally optional, server will compile if necessary automatically

        //await this.compile(config, descriptor);

        const options = {
            ...config,

            indexHtml: path.join(__dirname, 'config', 'index.html')
        };
        // Start the talon site.
        await run(options, 3333, '' /*apiEndpoint*/, true /*recordApiCalls*/);
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

    private copyStaticAsset(src: string, dest: string) {
        cpx.copy(src, dest, (e: Error) => {
            if (e === undefined || e === null) {
                console.log(`Done copying ${src} to ${dest}`);
            } else {
                console.error(`Error copying ${src} to ${dest}: ${e}`);
            }
        });
    }
}

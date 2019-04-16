import fs from 'fs';
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
import Project from './cli/common/Project';
import { fstat } from 'fs';

export default class LocalDevServer {
    public install(project: Project) {
        const assetsDir = path.join(
            project.getDirectory(),
            'dist',
            'public',
            'assets'
        );

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

    public build() {}

    public async start(project: Project, entryPoint: string) {
        console.log('LocalDevServer __dirname: ' + __dirname);
        // Okay in this directory lets do the following things.

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the talon compiler expects the directory name to be the namespace passed
        // to the descriptor.

        const directory = project.getDirectory();

        const config = {
            templateDir: directory,
            talonConfigJson: path.join(
                __dirname,
                'config',
                'talon.config.json'
            ),
            srcDir: project.getModuleSourceDirectory(),
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

    private copy(src: string, dest: string) {
        cpx.copy(src, dest, (e: Error) => {
            if (e === undefined || e === null) {
                console.log(`Done copying ${src} to ${dest}`);
            } else {
                console.error(`Error copying ${src} to ${dest}: ${e}`);
            }
        });
    }

    private processViews(
        viewsDirectory: string,
        outputDir: string,
        entryPoint: string
    ) {
        // For each of the views, open them up and update the component in them.
        // try {
        //     const files = fs.readdirSync(viewsDirectory, {});
        //     files.forEach((value: string, _index: number, array: string[]) => {
        //         //const content = fs.readFileSync(file);
        //         const json = require(value);
        //     });
        // } catch(err) {
        //     console.error(`Error reading views files: ${err}`);
        //     process.exitCode = 1;
        //     process.exit();
        // }
    }
}

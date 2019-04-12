/*
{
  "name": "my-ebikes-app",
  "version": "0.0.1",
  "scripts": {
    "clean": "rm -rf dist",
    "build:talon": "talon generate .",
    "build:public": "node scripts/copy-resources.js",
    "build": "npm run build:public && npm run build:talon",
    "serve": "MODE=\"${MODE:-dev}\" talon run .",
    "start": "npm run build:public --silent -- --watch & npm run serve --silent -- "
  },
  "devDependencies": {
    "@lwc/engine": "0.37.0",
    "@salesforce-ux/design-system": "^2.6.1",
    "@talon/compiler": "0.0.13",
    "@talon/force-modules": "^0.0.5",
    "colors": "^1.3.2",
    "cpx": "^1.5.0",
    "lwc-components-lightning": "1.1.6-alpha"
  },
  "engines": {
    "node": ">=10.0"
  }
}
*/
import path from 'path';
import colors from 'colors';
//import performance from 'perf_hooks';
import {
    startContext,
    endContext,
    getContext
} from '@talon/compiler/src/context/context-service';
import metadataService from '@talon/compiler/src/metadata/metadata-service';
import resourceService from '@talon/compiler/src/resources/resource-service';
import validate from '@talon/compiler/src/metadata/metadata-validation';
import { isMainThread } from 'worker_threads';

export default class LocalDevServer {
    public install() {}

    public build() {}

    public async start(directory: string) {
        // Okay in this directory lets do the following things.

        // Find where all the source code is.
        // This should have /lwc on the end, but I think the talon compiler expects the directory name to be the namespace passed
        // to the descriptor.
        const lwc_directory = path.join(directory, 'force-app/main/default');

        // Pass that to the Talon compiler.
        await this.run('component://lwc/app@en', lwc_directory);

        // Start the talon site.
    }

    private async run(descriptor: string, templateDir: string) {
        // const t0 = performance.now();
        let exitCode = 0;

        // start context
        return (
            startContext({
                templateDir
            })
                // Not sure what this does
                .then(validate)

                // Request compilation of the passed module.
                // Need typing on StaticResource
                .then(() => {
                    // generate a single resource
                    if (descriptor) {
                        return resourceService.get(descriptor);
                    }
                })
                .then((staticResource: any /*: StaticResource*/) => {
                    console.log(`Done. Received ${staticResource}`);
                    // log(`Done compiling templates in ${Math.floor(performance.now() - t0)} ms`.bold.blue);
                })
                .catch((err: Error) => {
                    console.error(err.stack || err.message || err);
                })
                .then(() => {
                    // We obviously should keep this open till we kill the process
                    endContext();
                })
        );
    }
}

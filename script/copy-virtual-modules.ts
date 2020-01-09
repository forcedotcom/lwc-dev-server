// LWC's module resolver has changed the format in 224, so until we update our
// webruntime dependency version (to a version using a newer LWC version), the
// 224+ version of LGC is not compatible. This code copies the virtual modules
// in the LGC package.json to the old format as a temporary workaround.

// When moving this file, also remove:
// 1. adding virtual-modules to the modulePaths in LocalDevServer.ts
// 2. the reference to this script in package.json

import path from 'path';
import { mkdir, ls, rm } from 'shelljs';
import fs from 'fs-extra';

const packageJsonTemplate = `
{
  "name": "lwc-dev-server-virtual-modules",
  "version": "0.0.1",
  "lwc": {
    "modules": []
  }
}
`;

const minVersion = 224;

const packageRoot = path.join(__dirname, '..');
const virtualModulesPath = path.join(packageRoot, 'virtual-modules');

const vendorsPath = path.join(
    require.resolve('@salesforce/lwc-dev-server-dependencies'),
    '..',
    'vendors'
);

// clean output directory
rm('-rf', virtualModulesPath);

// copy content from LGC dependencies in node_modules to output directory
ls(vendorsPath).forEach(childPath => {
    if (childPath.startsWith('dependencies')) {
        const split = childPath.split('-');
        const version = parseInt(split[1]);

        if (version >= minVersion) {
            const lightningComponentsPath = path.join(
                vendorsPath,
                childPath,
                'lightning-pkg'
            );

            const packageJsonPath = path.join(
                lightningComponentsPath,
                'package.json'
            );

            let packageJson: any;
            try {
                packageJson = JSON.parse(
                    fs.readFileSync(packageJsonPath, 'utf8')
                );
            } catch (e) {
                console.error(
                    `Loading ${packageJsonPath} failed JSON parsing with error ${e.message}`
                );
            }

            if (!packageJson.lwc) {
                console.error(`missing lwcConfig in ${packageJsonPath}`);
                return;
            } else if (
                !packageJson.lwc.modules ||
                !Array.isArray(packageJson.lwc.modules)
            ) {
                console.warn(`did not find any modules in ${packageJsonPath}`);
                return;
            }

            const modules: any[] = packageJson.lwc.modules;
            const newModules: any = [{}];

            modules.forEach(moduleEntry => {
                if (moduleEntry['name'] && moduleEntry['path']) {
                    const moduleName: string = moduleEntry.name;
                    const modulePath: string = moduleEntry.path;

                    const absoluteModulePath = path.join(
                        lightningComponentsPath,
                        modulePath
                    );
                    const relativeModulePath = path.relative(
                        __filename,
                        absoluteModulePath
                    );
                    newModules[0][moduleName] = relativeModulePath;
                }
            });

            const output = JSON.parse(packageJsonTemplate);
            output.lwc.modules = newModules;

            const outputDirectory = path.join(virtualModulesPath, `${version}`);
            mkdir('-p', outputDirectory);

            const outputPath = path.join(outputDirectory, 'package.json');
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        }
    }
});

import { compile } from '@talon/compiler/src/compiler/compiler-service';
import {
    startContext,
    endContext
} from '@talon/compiler/src/context/context-service';
import { resolveLwcNpmModules } from '@lwc/module-resolver';
import { labelsPlugin } from './rollup-plugin-oss-labels';
import fs from 'fs-extra';
import path from 'path';

const dirs = (p: string) =>
    fs
        .readdirSync(p)
        .filter(f => fs.statSync(path.join(p, f)).isDirectory())
        .map(f => p + '/' + f);

async function precompile() {
    const dir =
        '/Users/midzelis/git/duckburrito/lwc-dev-server-vendors/src/vendors/dependencies-222';
    const outputDir = '/tmp/output';

    const modulePaths = dirs(dir);
    const modules: any = resolveLwcNpmModules({
        modulePaths,
        ignorePatterns: [
            '**/node_modules/**',
            '**/__tests__/**',
            '**/__integration__/**',
            '**/__examples__/**'
        ]
    });
    const labels: any = {};
    for (const [k, v] of Object.entries(modules)) {
        const { entry } = v as { entry: string };
        if (k.startsWith('@salesforce/label')) {
            labels[k] = v;
            delete modules[k];
        } else if (entry.indexOf('__') != -1) {
            delete modules[k];
        }
    }
    console.log(`Found ${Object.keys(modules).length} modules...`);
    console.log(Object.keys(modules).join('\n'));
    const tmp = '/Users/midzelis/tmp';
    const context = {
        templateDir: dir,
        srcDir: dir,
        routes: {},
        theme: {},
        indexHtml: tmp + '/index.html',
        // TODO: bug when runInBand:false, plugins don't get passed
        // properly to worker threads
        runInBand: true,
        talonConfig: {
            rollup: {
                external: Object.keys(modules),
                plugins: [labelsPlugin(labels)]
            }
        },
        modes: ['prod']
    };
    startContext(context);
    try {
        for (const moduleName of Object.keys(modules)) {
            const result = await compile(moduleName);
            for (const [mode, output] of Object.entries(result)) {
                const [ns, name] = moduleName.split('/');
                let outDir;
                let outFile;
                if (name) {
                    outDir = path.join(outputDir, mode, ns);
                    outFile = path.join(outDir, name + '.js');
                } else {
                    outDir = path.join(outputDir, mode);
                    outFile = path.join(outDir, ns + '.js');
                }
                fs.ensureDirSync(outDir);
                console.log(`Writing ${outFile}`);
                await fs.writeFileSync(outFile, output);
            }
        }
    } catch (e) {
        console.log(e);
    } finally {
        endContext(context);
    }
    process.exit(0);
}

precompile();

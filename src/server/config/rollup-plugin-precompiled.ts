import path from 'path';
import debugLogger from 'debug';
import fs from 'fs-extra';
import { Plugin } from 'rollup';
import {
    resolveLwcNpmModules,
    resolveModulesInDir
} from '@lwc/module-resolver';

const debug = debugLogger('localdevserver');

const dirs = (p: string) =>
    fs
        .readdirSync(p)
        .filter(f => fs.statSync(path.join(p, f)).isDirectory())
        .map(f => p + '/' + f);

const files = (p: string) =>
    fs
        .readdirSync(p)
        .filter(f => fs.statSync(path.join(p, f)).isFile())
        .map(f => p + '/' + f);

export const modules: any = {};
export const pathOverrides: any = {};
export const moduleList = () => Object.keys(modules);
export const precompileDir = '/tmp/output/prod';

function init() {
    // look at the precompiled folder, use these as external modules for
    // compilation purposes
    const precompileDirLen = precompileDir.length + 1;
    const namespaceDirs = dirs(precompileDir);

    const modulesPaths = namespaceDirs
        .reduce((mod: any, dir: string) => mod.concat(...files(dir)), [])
        .filter((filename: string) => filename.endsWith('.js'));

    for (const filename of modulesPaths) {
        modules[
            filename.substring(precompileDirLen, filename.length - 3)
        ] = filename;
    }

    const lwcModules: any = resolveLwcNpmModules();
    const lwcModulesByEntry: any = {};
    // invert the list by entry
    for (const value of Object.values(lwcModules)) {
        //TODO typescript stupidness
        const v = value as any;
        lwcModulesByEntry[v.entry] = v;
    }

    for (const [moduleSpecifier, overridePath] of Object.entries(modules)) {
        const originalModule = lwcModules[moduleSpecifier];
        if (originalModule) {
            pathOverrides[originalModule.entry] = overridePath;
        }
    }
    console.dir(pathOverrides);
}

export function precompiled(): Plugin {
    return {
        name: 'rollup-plugin-precompiled',

        load(id: string) {
            debugger;
            console.log('precompile:', id);
            const entryOverride = pathOverrides[id];
            if (entryOverride) {
                console.log('entry override', id);
                return fs.readFile(entryOverride, 'utf8');
            }
            // no override, maybe its a direct reference
            const modulePath = modules[id];
            if (modulePath) {
                console.log('direct:', id);
                return fs.readFile(modulePath, 'utf8');
            }
            console.log('no override', id);
        },
        resolveId(id: string) {
            const modulePath = modules[id];
            return modulePath;
        }
    };
}

init();

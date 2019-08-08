import path from 'path';
import debugLogger from 'debug';
import fs from 'fs-extra';
import { Plugin } from 'rollup';
import { resolveLwcNpmModules } from '@lwc/module-resolver';
import jszip from 'jszip';

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

const modules: any = {};
const pathOverrides: any = {};
// const moduleList = () => Object.keys(modules);
const precompileDir = path.dirname(
    require.resolve('lwc-dev-server-runtime-lib')
);
const FOLDER = false;

let zip: jszip;

async function init() {
    if (FOLDER) {
        // TODO this is out of date, it needs to process multiple versions
        // and also add the 'precompiled:' prefix to the paths

        debug('Precompile dir ' + precompileDir);
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
        debug(pathOverrides);
    } else {
        const zipName = path.join(
            precompileDir,
            'lwc-dev-server-runtime-lib.zip'
        );
        debug('Precompile zip ' + zipName);
        zip = await new jszip.external.Promise((resolve, reject) => {
            fs.readFile(zipName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }).then((data: any) => {
            return jszip.loadAsync(data);
        });
        const zips = zip.folder(/dependencies-\d*\/$/);
        // look at the precompiled folder, use these as external modules for
        // compilation purposes

        for (const z of zips) {
            //@ts-ignore
            const version = /dependencies-(\d*)/.exec(z.name)[1];
            const files = zip.folder(z.name).file(/.*/);
            const mods: { [name: string]: string } = {};
            for (const f of files) {
                const fileSegments = f.name.split('/');
                const moduleName =
                    fileSegments[fileSegments.length - 2] +
                    '/' +
                    fileSegments[fileSegments.length - 1].slice(0, -3);
                mods[moduleName] = PRECOMPILED_PREFIX + f.name;
            }
            modules[version] = mods;
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
    }
}

export const PRECOMPILED_PREFIX = '/PRECOMPILED/';
export function precompiled({
    apiVersion
}: {
    apiVersion: string | number;
}): Plugin {
    return {
        name: 'rollup-plugin-precompiled',

        load(id: string) {
            if (id.startsWith(PRECOMPILED_PREFIX)) {
                const entry = id.substring(PRECOMPILED_PREFIX.length);
                debug(`Loading precompiled: ${id}`);
                //TODO: PATH OVERRIDES ISNT WORKING, NO NEED RIGHT NOW
                // const entryOverride = pathOverrides[entry];
                // if (entryOverride) {
                //     if (FOLDER) {
                //         debug('entry override', entry);
                //         return fs.readFile(entryOverride, 'utf8');
                //     } else {
                //         return zip.file(entry).async('text');
                //     }
                // }
                // no override, maybe its a direct reference
                return zip.file(entry).async('text');
            }
            return null;
        },
        resolveId(id: string) {
            const modulePath = modules[apiVersion][id];
            return modulePath;
        }
    };
}

init();

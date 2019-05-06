#!/usr/bin/env node

// This is fragile-- we should not GA with this. This installs all the tarballs
// from lib with the following steps:
// 1) unpack them to lib/unpacked
// 2) fix references to other local deps to point to the unpacked folders e.g.,
//    if @talon/compiler has a dep on @talon/common, rewrite the dep to point to
//    the local file dep instead. dangerous!
// 3) calls `yarn add` or `npm add` to install the package and their
//    subdependencies.

const argv = process.env.npm_config_argv;
const args = argv !== undefined ? JSON.parse(argv).original : [];
console.error(args);
const installcmds = ['install', 'i', 'add'];
let doRun = false;
if (process.env.SKIP_INSTALL_LIBS) {
    doRun = false;
} else if (
    args.length === 0 ||
    (args.length > 0 && installcmds.includes(args[0]))
) {
    doRun = true;
} else if (
    args.length > 2 &&
    args[0] === 'add' &&
    args[1] === 'lwc-dev-server'
) {
    doRun = true;
}

if (!doRun) {
    return;
}

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const gunzip = require('gunzip-maybe');
const tar = require('tar-fs');
const { performance } = require('perf_hooks');

const libPath = path.join(__dirname, '..', 'lib');
const unpackPath = path.join(libPath, 'unpacked');

(async () => {
    try {
        const start = performance.now();
        const packages = await readPackages();
        console.error(packages);
        await addPackages(packages);
        const end = performance.now();
        console.error('libs-install took ' + (end - start) + ' ms');
    } catch (e) {
        console.error(`unable to install local libs - ${e}`);
        process.exit(1);
    }
})();

async function readPackages() {
    const jsonPath = path.join(unpackPath, 'packages.json');
    if (!fs.existsSync(jsonPath)) {
        throw new Error(
            `${jsonPath} does not exist, run libs-unpack.json first`
        );
    }
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

async function addPackages(packages) {
    const command = process.env.npm_execpath || 'yarn';
    console.error('execpath', command);
    Object.keys(packages).forEach(pkg => {
        const dir = packages[pkg].dir;
        shell.exec(`SKIP_INSTALL_LIBS=1 ${command} add file:${dir}`);
    });
}

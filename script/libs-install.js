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

const rootPath = path.join(__dirname, '..');
const libPath = path.join(rootPath, 'lib');
const unpackPath = path.join(libPath, 'unpacked');

(async () => {
    try {
        const start = performance.now();
        await prepare();
        const dirs = await unpack();
        console.error('unpacked', dirs);
        const packages = await getPackages(dirs);
        console.error(JSON.stringify(packages, null, 2));
        await fixReferences(packages);
        await addPackages(packages);
        const end = performance.now();
        console.error('libs-install took ' + (end - start) + ' ms');
    } catch (e) {
        console.error(`unable to install local libs - ${e}`);
        process.exit(1);
    }
})();

function prepare() {
    // create clean unpacked dir
    console.error('libPath', libPath, unpackPath);
    if (fs.existsSync(unpackPath)) {
        shell.rm('-rf', unpackPath);
    }
    shell.mkdir('-p', unpackPath);
}

async function unpack() {
    const tarballs = shell.ls(path.join(libPath, '*.tgz'));

    return Promise.all(
        tarballs.map(tarball => {
            return new Promise((resolve, reject) => {
                const dir = path.basename(tarball, path.extname(tarball));
                const dest = path.join(unpackPath, dir);
                const tmpdest = path.join(unpackPath, 'tmp', dir);
                fs.createReadStream(tarball)
                    .pipe(gunzip())
                    .pipe(tar.extract(tmpdest))
                    .on('finish', () => {
                        shell.mv(path.join(tmpdest, 'package'), dest);
                        resolve(dest);
                    })
                    .on('error', e => reject(e));
            });
        })
    );
}

async function getPackages(dirs) {
    const packages = {};

    dirs.forEach(dir => {
        const pkgPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

            const previous = packages[json.name];
            if (previous !== undefined) {
                throw new Error(
                    `package '${
                        json.name
                    }' is specified by duplicate sources '${
                        previous.dir
                    }' and '${dir}'`
                );
            }

            const relDir = path.relative(rootPath, dir);

            packages[json.name] = {
                dir: relDir,
                version: json.version
            };
        }
    });

    return packages;
}

async function fixReferences(packages) {
    Object.keys(packages).forEach(pkg => {
        const packageFile = path.join(packages[pkg].dir, 'package.json');
        const json = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        let updated = false;
        if (json.dependencies) {
            Object.keys(json.dependencies).forEach(depKey => {
                if (packages[depKey]) {
                    const replacement =
                        'file:' +
                        path.relative(packages[pkg].dir, packages[depKey].dir);
                    console.error(
                        `replacing '${depKey}' in package '${pkg}' with '${replacement}'`
                    );
                    json.dependencies[depKey] = replacement;
                    updated = true;
                }
            });
        }
        if (updated) {
            fs.writeFileSync(
                packageFile,
                JSON.stringify(json, null, 2),
                'utf8'
            );
        }
    });
}

async function addPackages(packages) {
    const command = process.env.npm_execpath || 'yarn';
    console.error('execpath', command);
    Object.keys(packages).forEach(pkg => {
        const dir = packages[pkg].dir;
        shell.exec(`SKIP_INSTALL_LIBS=1 ${command} add file:${dir}`);
    });
}

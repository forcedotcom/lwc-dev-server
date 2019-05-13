#!/usr/bin/env node

// This is fragile-- we should not GA with this. This installs all the tarballs
// from lib with the following steps:
// 1) unpack them to lib/unpacked.
// 2) fix references to other local deps to point to the unpacked folders e.g.,
//    if @talon/compiler has a dep on @talon/common, rewrite the dep to point to
//    the local file dep instead. dangerous!
// 3) calls `yarn add` or `npm add` to install the package and their
//    subdependencies.

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const gunzip = require('gunzip-maybe');
const tar = require('tar-fs');
const { performance } = require('perf_hooks');

// only run on commands like `yarn`, `yarn install`, `npm install`,
// `yarn add lwc-dev-server`
const argv = process.env.npm_config_argv;
let args = argv !== undefined ? JSON.parse(argv).original : [];
args = args.filter(arg => !arg.startsWith('-'));

if (
    process.env.IS_LIBS_INSTALL ||
    (args.length > 0 && !['install', 'i', 'add'].includes(args[0])) ||
    (args.length > 1 && !args.some(arg => arg.includes('lwc-dev-server')))
) {
    return;
}

const rootPath = path.join(__dirname, '..');
const libPath = path.join(rootPath, 'lib');
const unpackPath = path.join(libPath, 'unpacked');

(async () => {
    try {
        const start = performance.now();
        prepare();

        const dirs = await unpack();
        const packages = getPackageData(dirs);
        console.log('found local packages:');
        console.dir(packages);

        fixReferences(packages);
        addPackages(packages);

        const end = performance.now();
        console.error(`libs-install took ${end - start} ms`);
    } catch (e) {
        console.error(`unable to install local libs - ${e}`);
        process.exit(1);
    }
})();

function prepare() {
    // create clean unpacked dir
    shell.rm('-rf', unpackPath);
    shell.mkdir('-p', unpackPath);
}

async function unpack() {
    const tarballs = shell.ls(path.join(libPath, '*.tgz'));

    const promises = tarballs.map(tarball => {
        return new Promise((resolve, reject) => {
            const dir = path.basename(tarball, path.extname(tarball));
            const dest = path.join(unpackPath, dir);
            const tmpDest = path.join(unpackPath, 'tmp', dir);

            fs.createReadStream(tarball)
                .pipe(gunzip())
                .pipe(tar.extract(tmpDest))
                .on('error', e => reject(e))
                .on('finish', () => {
                    shell.mv(path.join(tmpDest, 'package'), dest);
                    resolve(dest);
                });
        });
    });

    return Promise.all(promises);
}

function getPackageData(dirs) {
    const packages = {};

    dirs.forEach(dir => {
        const pkgJsonPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

            // throw error if there are multiple tarballs for the same package
            const previous = packages[pkgJson.name];
            if (previous !== undefined) {
                throw new Error(
                    `package '${
                        pkgJson.name
                    }' is specified by duplicate sources '${
                        previous.dir
                    }' and '${dir}'`
                );
            }

            packages[pkgJson.name] = {
                dir: path.relative(rootPath, dir),
                version: pkgJson.version
            };
        }
    });

    return packages;
}

function fixReferences(packages) {
    Object.keys(packages).forEach(pkg => {
        const pkgJsonPath = path.join(packages[pkg].dir, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

        let updated = false;
        if (pkgJson.dependencies) {
            Object.keys(pkgJson.dependencies).forEach(name => {
                if (packages[name]) {
                    const original = pkgJson.dependencies[name];
                    const replacement = packages[name].version;

                    if (!pkgJson.peerDependencies) {
                        pkgJson.peerDependencies = {};
                    }
                    pkgJson.peerDependencies[name] = replacement;
                    delete pkgJson.dependencies[name];
                    updated = true;

                    console.log(
                        `${pkg}: moved dependency '${name}@${original}' to peerDependency matching local version '${replacement}'`
                    );
                    if (!original.endsWith(replacement)) {
                        console.warn(
                            `warning: the local version does not match the original version specfied by the package.\n         replace the local tarball for '${name}' with a version matching '${original}'`
                        );
                    }
                }
            });
        }
        if (updated) {
            fs.writeFileSync(
                pkgJsonPath,
                JSON.stringify(pkgJson, null, 2),
                'utf8'
            );
        }
    });
}

function addPackages(packages) {
    const execpath = process.env.npm_execpath || 'yarn';
    Object.keys(packages).forEach(pkg => {
        const dir = packages[pkg].dir;
        const command = `${execpath} add file:${dir}`;
        console.log(command);
        const { stderr } = shell.exec(`IS_LIBS_INSTALL=1 ${command}`, {
            silent: true
        });
        if (stderr) {
            console.error(stderr);
        }
    });
}

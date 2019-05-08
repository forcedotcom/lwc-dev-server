#!/usr/bin/env node

// This script will ensure the given registry (e.g., http://platform-cli-registry.eng.sfdc.net:4880) has the private npm packages from nexus.

const lockfile = require('@yarnpkg/lockfile');
const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const gunzip = require('gunzip-maybe');
const tar = require('tar-fs');

const packages = [
    'lwc-components-lightning',
    '@talon/force-modules',
    '@talon/metadata-schema',
    '@talon/common',
    '@talon/framework',
    '@talon/compiler'
];

const registry =
    'https://nexus.soma.salesforce.com/nexus/content/groups/npm-all/';

const sfdxRegistry = 'http://platform-cli-registry.eng.sfdc.net:4880';

const file = fs.readFileSync('yarn.lock', 'utf8');
const json = lockfile.parse(file);

(async () => {
    try {
        const data = {};

        // find internal package dependencies
        Object.keys(json.object).forEach(key => {
            const index = key.lastIndexOf('@');
            const name = index > -1 ? key.substring(0, index) : key;
            const version = json.object[key].version;
            if (packages.includes(name)) {
                if (!data[name]) {
                    data[name] = { versions: [] };
                }
                data[name].versions.push(version);
            }
        });

        Object.keys(data).forEach(pkg => {
            data[pkg].versions = [...new Set(data[pkg].versions)]; //uniq
        });

        console.log('found internal packages:');
        console.dir(data);

        const tmpPath = path.join(__dirname, 'sync-registry-tmp');
        shell.rm('-rf', tmpPath);
        shell.mkdir('-p', tmpPath);

        Object.keys(data).forEach(key => {
            const versions = data[key].versions;
            versions.forEach(version => {
                console.log(
                    `yarn info ${key}@${version} dist.tarball --registry ${sfdxRegistry}`
                );
                const { stdout } = shell.exec(
                    `yarn info ${key}@${version} dist.tarball --registry ${sfdxRegistry}`,
                    { silent: true }
                );
                const present = stdout.includes(sfdxRegistry);
                console.log('present:', present);
                if (!present) {
                    shell.exec(
                        `cd ${tmpPath} && npm pack ${key}@${version} --registry ${registry}`
                    );
                }
            });
        });

        const dirs = await unpack(tmpPath);
        console.log(dirs);

        dirs.forEach(dir => {
            const pkgPath = path.join(dir, 'package');
            const pkgJsonPath = path.join(pkgPath, 'package.json');
            if (fs.existsSync(pkgJsonPath)) {
                const json = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                delete json.publishConfig;
                json.nathan = 'true';
                fs.writeFileSync(
                    pkgJsonPath,
                    JSON.stringify(json, null, 2),
                    'utf8'
                );
                //shell.exec(`npm publish ${pkgPath} --registry ${sfdxRegistry}`);
            } else {
                console.error(`did not find package.json at ${pkgJsonPath}`);
            }
        });

        await pack(dirs, tmpPath);

        const tarballs = shell.ls(path.join(tmpPath, '*.tgz'));
        console.dir(tarballs);
        tarballs.forEach(tarball => {
            shell.exec(`npm publish ${tarball} --registry ${sfdxRegistry}`);
        });

        shell.rm('-rf', tmpPath);
    } catch (e) {
        console.error(`uerror - ${e}`);
        process.exit(1);
    }
})();

async function unpack(libPath) {
    const tarballs = shell.ls(path.join(libPath, '*.tgz'));

    return Promise.all(
        tarballs.map(tarball => {
            return new Promise((resolve, reject) => {
                const dir = path.basename(tarball, path.extname(tarball));
                const dest = path.join(libPath, dir);
                fs.createReadStream(tarball)
                    .pipe(gunzip())
                    .pipe(tar.extract(dest))
                    .on('finish', () => resolve(dest))
                    .on('error', e => reject(e));
            });
        })
    );
}

async function pack(dirs, rootPath) {
    return Promise.all(
        dirs.map(dir => {
            return new Promise((resolve, reject) => {
                const name = path.basename(dir) + '.tgz';
                const dest = path.join(rootPath, name);
                tar.pack(dir)
                    .pipe(fs.createWriteStream(dest))
                    .on('end', () => resolve())
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            });
        })
    );
}

// find out which ones exist

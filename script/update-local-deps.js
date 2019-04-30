#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const shell = require('shelljs');

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

// clear previous versions
const dir = 'lib';
const dest = path.join(__dirname, '../', dir);
if (fs.existsSync(dest)) {
    console.log(`clearing '${dest}' directory`);
    rimraf.sync(dest);
}
fs.mkdirSync(dest);

const mapping = {};

packages.forEach(pkg => {
    console.log(`\ndownloading ${pkg}`);
    const out = shell.exec(
        `cd ${dest} && npm pack ${pkg} --registry ${registry}`
    ).stdout;
    mapping[pkg] = `file:./${dir}/${out.trim()}`;
});

console.log('downloads complete');

console.log('\ncurrent versions:');
console.dir(mapping);

const status = shell.exec(`git status ${dir}`, { silent: true }).stdout;
if (status.indexOf('nothing to commit') > -1) {
    console.log('\nno changes');
} else {
    console.log('\nupdating package.json');
    const packageFile = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

    Object.keys(mapping).forEach(key => {
        if (packageJson.dependencies && packageJson.dependencies[key]) {
            packageJson.dependencies[key] = mapping[key];
        }

        if (packageJson.devDependencies && packageJson.devDependencies[key]) {
            packageJson.devDependencies[key] = mapping[key];
        }

        if (packageJson.peerDependencies && packageJson.peerDependencies[key]) {
            packageJson.peerDependencies[key] = mapping[key];
        }

        if (
            packageJson.bundledDependencies &&
            packageJson.bundledDependencies[key]
        ) {
            packageJson.bundledDependencies[key] = mapping[key];
        }

        if (
            packageJson.optionalDependencies &&
            packageJson.optionalDependencies[key]
        ) {
            packageJson.optionalDependencies[key] = mapping[key];
        }

        if (packageJson.resolutions && packageJson.resolutions[key]) {
            packageJson.resolutions[key] = mapping[key];
        }
    });

    fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('package.json updated');

    // update yarn lock
    console.log('\nupdating yarn lock file');
    shell.exec('yarn');
}

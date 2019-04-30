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
const dest = path.join(__dirname, '../lib');
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
    mapping[pkg] = `file:./lib/${out.trim()}`;
});
console.log('downloads complete');

console.log('\ncurrent versions:');
console.dir(mapping);

const status = shell.exec(`git status lib`, { silent: true }).stdout;
if (status.indexOf('nothing to commit') > -1) {
    console.log('\nno changes made to package.json');
} else {
    console.log('\nupdating package.json');
    const packageFile = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

    const sections = [
        'dependencies',
        'devDependencies',
        'peerDependdencies',
        'bundleDependencies',
        'optionalDependencies',
        'resolutions'
    ];

    Object.keys(mapping).forEach(depKey => {
        sections.forEach(section => {
            if (packageJson[section] && packageJson[section][depKey]) {
                packageJson[section][depKey] = mapping[depKey];
            }
        });
    });

    fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('package.json updated');

    console.log('\nupdating yarn lock file');
    shell.exec('yarn');
}

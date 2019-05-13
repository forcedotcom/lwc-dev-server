#!/usr/bin/env node

// This script updates all local libs from the nexus registry.

const fs = require('fs');
const path = require('path');
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
    shell.rm('-rf', dest);
}
fs.mkdirSync(dest);

const mapping = {};

packages.forEach(pkg => {
    console.log(`\ndownloading ${pkg}`);
    const { stdout } = shell.exec(
        `cd ${dest} && npm pack ${pkg} --registry ${registry}`
    );
    mapping[pkg] = `file:lib/${stdout.trim()}`;
});
console.log('downloads complete');

console.log('\ncurrent versions:');
console.dir(mapping);

const status = shell.exec(`git status lib`, { silent: true }).stdout;
if (status.indexOf('nothing to commit') > -1) {
    console.log('\nno changes made to package.json');
} else {
    console.log('\ninstalling all libs');
    shell.exec('yarn');
}

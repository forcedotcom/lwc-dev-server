#!/usr/bin/env node

// This script updates all local libs from the nexus registry.

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const packages = {
    // NOTICE: the next two are precompiled
    // 'lwc-components-lightning': 'main',
    // '@talon/force-modules': 'latest',
    '@talon/navigation': 'latest',
    '@talon/metadata-schema': 'latest',
    '@talon/common': 'latest',
    '@talon/framework': 'latest',
    '@talon/compiler': 'latest',
    '@lbf/utils': '0.1.15',
    '@lbf/interactions': '0.1.6'
};

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

Object.keys(packages).forEach(pkg => {
    const tag = packages[pkg];
    console.log(`\ndownloading ${pkg}@${tag}`);
    const { stdout } = shell.exec(
        `cd ${dest} && npm pack ${pkg}@${tag} --registry ${registry}`
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

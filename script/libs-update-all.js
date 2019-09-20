#!/usr/bin/env node

// This script updates all local libs from the nexus registry.

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const packages = {
    '@lbf/interactions': 'latest', // TODO this is temporary I believe
    '@lbf/utils': 'latest', // TODO this is temporary I believe
    '@talon/force-modules': '0.0.5', // TODO issue with sldsv3
    '@talon/metadata-schema': '0.0.18',
    '@talon/common': 'latest',
    '@talon/framework': 'latest',
    '@talon/compiler': 'latest',
    '@talon/navigation': 'latest'
};

const registry =
    'https://nexus-proxy-prd.soma.salesforce.com/nexus/content/groups/npm-all/';

// clear previous versions
const dest = path.join(__dirname, '../lib');
if (fs.existsSync(dest)) {
    console.log(`clearing '${dest}' directory`);
    shell.rm('-rf', dest);
}
fs.mkdirSync(dest);

const mapping = {};

Object.keys(packages).forEach(pkg => {
    console.log(`\ndownloading ${pkg}`);
    const tag = packages[pkg];
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

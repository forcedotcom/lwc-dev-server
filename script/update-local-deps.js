#!/usr/bin/env node
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

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
const dest = path.join(__dirname, '../', 'lib');
if (fs.existsSync(dest)) {
    console.log(`clearing '${dest}' directory`);
    rimraf.sync(dest);
}
fs.mkdirSync(dest);

packages.forEach(pkg => {
    console.log(`\ndownloading ${pkg}`);
    shell.exec(`cd lib && npm pack ${pkg} --registry ${registry}`);
});

console.log('downloads complete');

// update package.json dependencies/devDependencies/resolutions

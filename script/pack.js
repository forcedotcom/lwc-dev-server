#!/usr/bin/env node

// This script creates distribution packages via `oclif-dev pack`. oclif-dev
// bundles the entire project using `npm pack`, plus it includes a copy of node
// and all dependencies (node_modules). Note that `npm pack` includes the
// whitelisted `files` specified in package.json.
// More info here: https://oclif.io/docs/releasing

const shell = require('shelljs');
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');

// check that `yarn install` was already run
if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
    console.error('run `yarn install && yarn build` first');
    process.exit(1);
}

// check that `yarn build` was already run
const buildPaths = [
    path.join(__dirname, '../dist/config'),
    path.join(__dirname, '../dist/cli'),
    path.join(__dirname, '../dist/LocalDevServer.d.ts'),
    path.join(__dirname, '../dist/LocalDevServer.js')
];
buildPaths.forEach(p => {
    if (!fs.existsSync(p)) {
        console.error(
            `missing expected build output '${p}'. Please run 'yarn build' then try again.`
        );
        process.exit(1);
    }
});

// clear previous output if present
const tmpPath = path.join(__dirname, '../tmp');
if (fs.existsSync(tmpPath)) {
    console.log(`clearing previous '${tmpPath}' directory`);
    rimraf.sync(tmpPath);
}

// pack
console.log('packing with oclif-dev');
shell.exec(`yarn oclif-dev pack`);

// clear output
if (fs.existsSync(tmpPath)) {
    console.log(`clearing '${tmpPath}' output folder`);
    rimraf.sync(tmpPath);
}

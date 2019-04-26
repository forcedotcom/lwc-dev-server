#!/usr/bin/env node
const shell = require('shelljs');
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');

// check for proper build setup
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

const tmpPath = path.join(__dirname, '../tmp');

// clear previous output if present
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

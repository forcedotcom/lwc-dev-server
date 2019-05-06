#!/usr/bin/env node

// This is used in conjunction with packagejson-restore.js.
//
// The 'file:...' dependencies in package.json should not be persisted to a
// published package. They don't work with yarn or npm due to various issues and
// npm doc itself says packages should not be published with them.
//
// As a hack this script removes the file dependencies before publishing. They
// will be reinstalled when the postinstall script runs on the client.

const shell = require('shelljs');
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');

const pkgJsonPath = path.join(__dirname, '..', 'package.json');
const pkgJsonOrigPath = path.join(__dirname, '..', 'package.json.orig');

shell.cp(pkgJsonPath, pkgJsonOrigPath);
console.log('backed up package.json to package.json.orig');

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

const fileDependencies = [];

Object.keys(pkgJson.dependencies).forEach(key => {
    if (pkgJson.dependencies[key].startsWith('file:')) {
        fileDependencies.push(key);
        delete pkgJson.dependencies[key];
    }
});

if (pkgJson.bundledDependencies) {
    pkgJson.bundledDependencies = pkgJson.bundledDependencies.filter(dep => {
        !fileDependencies.contains(dep);
    });
}

console.log(`removed from package.json: ${fileDependencies}`);

fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
console.error('package.json updated');

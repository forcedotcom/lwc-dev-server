#!/usr/bin/env node

// This script reverses the changes made by packagejson-clean.js by restoring
// the package.json file from package.json.orig.

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const pkgJsonPath = path.join(__dirname, '..', 'package.json');
const pkgJsonOrigPath = path.join(__dirname, '..', 'package.json.orig');

if (fs.existsSync(pkgJsonOrigPath)) {
    shell.mv(pkgJsonOrigPath, pkgJsonPath);
    console.log('restore package.json from package.json.orig');
}

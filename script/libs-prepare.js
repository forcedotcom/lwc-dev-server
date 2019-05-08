#!/usr/bin/env node

// This script creates the necessary folder structure in lib/unpacked based on
// the `file:...` dependencies in package.json. This allows the install to
// proceed even though the tarballs may not be unpacked yet.

const path = require('path');
const fs = require('fs');

const unpackedPath = path.join(__dirname, '..', 'lib', 'unpacked');
const pkgJsonPath = path.join(__dirname, '..', 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

if (!fs.existsSync(unpackedPath)) {
    fs.mkdirSync(unpackedPath);
}

Object.keys(pkgJson.dependencies).forEach(key => {
    const value = pkgJson.dependencies[key];
    if (value.startsWith('file:')) {
        const relativePath = value.substring('file:'.length);
        const fullPath = path.join(__dirname, '..', relativePath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
            console.log(`created ${fullPath}`);
        }
    }
});

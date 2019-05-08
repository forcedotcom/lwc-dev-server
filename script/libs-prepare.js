#!/usr/bin/env node

// TODO

const path = require('path');
const fs = require('fs');

const pkgJsonPath = path.join(__dirname, '..', 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

const fileDependencies = [];

Object.keys(pkgJson.dependencies).forEach(key => {
    if (pkgJson.dependencies[key].startsWith('file:')) {
        const value = pkgJson.dependencies[key];
        const depPath = value.substring('file:'.length);
        fileDependencies.push(depPath);
    }
});

const unpackedPath = path.join(__dirname, '..', 'lib', 'unpacked');
if (!fs.existsSync(unpackedPath)) {
    fs.mkdirSync(unpackedPath);
}

fileDependencies.forEach(dep => {
    const depRelPath = dep.substring();
    const depPath = path.join(__dirname, '..', dep);
    if (!fs.existsSync(depPath)) {
        fs.mkdirSync(depPath);
        console.log(`created ${depPath}`);
    }
});

#!/usr/bin/env node

// This script runs `yarn build` after a yarn install in build environments

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

// only run on commands like `yarn`, `yarn install`, `npm install`
const argv = process.env.npm_config_argv;
let args = argv !== undefined ? JSON.parse(argv).original : [];
args = args.filter(arg => !arg.startsWith('-'));
if (
    !process.env.IS_LIBS_INSTALL &&
    (args.length === 0 ||
        (args.length === 1 && ['install', 'i'].includes(args[0])))
) {
    // only on dev builds
    const srcPath = path.join(__dirname, '..', 'src');
    if (fs.existsSync(srcPath)) {
        shell.exec('yarn build');
    }
}

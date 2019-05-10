#!/usr/bin/env node

// This script runs `yarn build` after an install in build environments

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

// only run on install commands like `yarn`, `yarn install`, `npm install`
const argv = process.env.npm_config_argv;
let args = argv !== undefined ? JSON.parse(argv).original : [];
args = args.filter(arg => !arg.startsWith('-'));
if (
    process.env.SKIP_LIBS_INSTALL ||
    (args.length > 0 && !['install', 'i', 'add'].includes(args[0])) ||
    (args.length > 1 && !args.includes('lwc-dev-server'))
) {
    return;
}

// only on dev builds
const srcPath = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcPath)) {
    shell.exec('yarn build');
}

#!/usr/bin/env node

/**
 * @fileoverview Run the local dev server in the current directory.
 */

'use strict';

import localDevServer from './dist/LocalDevServer.js';

// The Current directory you ran this command in.
const currentDirectory = process.cwd();

// We're about to do something.
console.log(`Running local dev tools on directory: ${currentDirectory}`);

// Run the Compiler
localDevServer.install();
localDevServer.build();
localDevServer.start();

// Yay! We did it.
console.log('Done running local dev tools.');

// All is good.
process.exitCode = 0;

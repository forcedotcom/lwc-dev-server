#!/usr/bin/env node

/**
 * @fileoverview Run the local dev server in the current directory.
 */

'use strict';

// The Current directory you ran this command in.
const currentDirectory = __dirname;

// We're about to do something.
console.log(`Running local dev tools on directory: ${currentDirectory}`);

// Yay! We did it.
console.log('Done running local dev tools.');

// All is good.
process.exitCode = 0;

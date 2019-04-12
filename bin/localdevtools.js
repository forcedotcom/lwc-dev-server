#!/usr/bin/env node

/**
 * @fileoverview Run the local dev server in the current directory.
 */

'use strict';

//import localDevServer from './dist/LocalDevServer.js';
const LocalDevServer = require('../dist/LocalDevServer.js');

// The Current directory you ran this command in.
const currentDirectory = process.cwd();

// We're about to do something.
console.log(`Running local dev tools on directory: ${currentDirectory}`);

const localDevServer = new LocalDevServer.default();

// Run Local Dev Server
localDevServer.install();

// Do we need build?
// Start seems sufficient.
localDevServer.build();

// Start the server?
localDevServer.start(currentDirectory);

// Yay! We did it.
console.log('Done running local dev tools.');

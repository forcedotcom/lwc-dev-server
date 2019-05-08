#!/usr/bin/env node

// This script downloads a tarball from npm into the lib folder with the
// following steps:
// 1) download the lib from nexus using npm pack (you must have access).
// 2) remove existing libs that match the package name.
// 3) update all installed libs using the libs-update-all script.

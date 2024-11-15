/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
'use strict';

const fs = require('fs');
const path = require('path');
const lwcResolver = require('@lwc/jest-resolver');

const {
    PROJECT_ROOT,
    getModulePaths,
    DEFAULT_NAMESPACE
} = require('./utils/project.js');

const { getInfoFromId } = require('./utils/module.js');

const debugLogger = require('debug');
const debug = debugLogger('localdevserver:test');

function isFile(file) {
    let result;

    try {
        const stat = fs.statSync(file);
        result = stat.isFile() || stat.isFIFO();
    } catch (e) {
        if (!(e && e.code === 'ENOENT')) {
            throw e;
        }
        result = false;
    }

    return result;
}

function resolveAsFile(name, extensions) {
    if (isFile(name)) {
        return name;
    }

    for (let i = 0; i < extensions.length; i++) {
        const file = name + extensions[i];
        if (isFile(file)) {
            return file;
        }
    }

    return undefined;
}

function getLightningMock(modulePath) {
    const stubs = path.join(
        require.resolve('@salesforce/lwc-jest/package.json'),
        '..',
        'src',
        'lightning-stubs'
    );
    const p = path.join(stubs, modulePath);
    if (fs.existsSync(p)) {
        return path.join(p, modulePath + '.js');
    }
}

function getModule(modulePath, options) {
    const { ns, name } = getInfoFromId(modulePath);

    if (ns === 'lightning') {
        return getLightningMock(name);
    }

    if (ns === DEFAULT_NAMESPACE) {
        const paths = getModulePaths();
        for (let i = 0; i < paths.length; i++) {
            const file = resolveAsFile(
                path.join(PROJECT_ROOT, paths[i], name, name),
                options.extensions
            );
            if (file) {
                return fs.realpathSync(file);
            }
        }
    }
}

/**
 * NOTE: lwc-dev-tools changes
 */
let resolver;
try {
    resolver = require('jest-resolve/build/default_resolver').default;
} catch (e) {
    resolver = require('jest-resolve/build/defaultResolver').default;
}

module.exports = function(modulePath, options) {
    if (modulePath === 'lwc') {
        return require.resolve('@lwc/engine');
    }

    if (modulePath === '@salesforce/lwc-dev-server-dependencies') {
        return path.join(
            PROJECT_ROOT,
            'node_modules',
            '@salesforce',
            'lwc-dev-server-dependencies',
            'vendors'
        );
    }

    /**
     * NOTE: lwc-dev-tools changes
     */

    if (modulePath.startsWith('webruntime_navigation')) {
        modulePath = modulePath.replace(
            /(webruntime_navigation)\/(.+)$/,
            path.join(
                __dirname,
                '../node_modules/@webruntime/navigation/src/modules/$1/$2/$2'
            )
        );
        const resolved = resolver.call(null, modulePath, options);
        if (resolved) {
            return resolved;
        }
    }

    // allow overrides of local modules in tests, under the __mocks__ folder in the module
    if (modulePath.includes('localdevserver')) {
        const split = modulePath.split(path.sep);
        if (split.length > 3) {
            const ns = split[split.length - 3];
            const name = split[split.length - 1];
            const mockPath = path.normalize(
                `${options.basedir}/__mocks__/${ns}/${name}/${name}.js`
            );
            if (fs.existsSync(mockPath)) {
                debug(
                    `replacing module '${modulePath}' with __mocks__ version '${mockPath}'`
                );
                return lwcResolver(mockPath, options);
            }
        }
    }

    // allow mocks for custom components in tests, under the __mocks__ folder in the module
    if (modulePath.startsWith('c/')) {
        const split = modulePath.split('/');
        if (split.length == 2) {
            const ns = split[0];
            const name = split[1];
            const mockPath = path.normalize(
                `${options.basedir}/__mocks__/${ns}/${name}/${name}.js`
            );
            if (fs.existsSync(mockPath)) {
                debug(
                    `replacing module '${modulePath}' with __mocks__ version '${mockPath}'`
                );
                return lwcResolver(mockPath, options);
            }
        }
    }

    return getModule(modulePath, options) || lwcResolver.apply(null, arguments);
};

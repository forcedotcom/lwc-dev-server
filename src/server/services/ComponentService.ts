/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    AddressableService,
    ContainerContext,
    RequestOutput,
    RequestOutputTypes,
    RequestParams,
    RequestService
} from '@webruntime/api';
import { compile } from '@webruntime/compiler';
import { resolveModules } from '@lwc/module-resolver';
import { CompilerResourceMetadata } from '../../common/CompilerResourceMetadata';

const URI_PREFIX = `/component`;

const uri = [
    `${URI_PREFIX}/:uid/:mode/:locale/:name`,
    `${URI_PREFIX}/:uid/:mode/:locale/:namespace/:name`
];

interface Module {
    name: string;
    namespace: string;
    specifier: string;
}

interface Mappings {
    [key: string]: string;
}

const MODULE_EXCLUSIONS = new Set(['@salesforce/label']);

export class ComponentService extends AddressableService
    implements RequestService {
    mappings: Mappings = {};

    private projectDir: string;
    private moduleDir?: string;
    private customModuleDirs: string[];
    private modules: Module[] = [];

    constructor({
        projectDir,
        moduleDir,
        compilerConfig: { lwcOptions }
    }: {
        projectDir: string;
        moduleDir: string;
        compilerConfig: {
            lwcOptions: {
                modules: string[];
            };
        };
    }) {
        super(uri);
        this.projectDir = projectDir;
        this.moduleDir = moduleDir;
        this.customModuleDirs =
            lwcOptions && lwcOptions.modules ? lwcOptions.modules : [];
    }

    async initialize() {
        this.modules = resolveAllModules(
            this.projectDir,
            this.moduleDir,
            this.customModuleDirs
        );
        this.mappings = computeMappings(this.modules, this.mappings);
    }

    async request(
        specifier: string,
        pivots: RequestParams,
        { compilerConfig }: ContainerContext
    ): Promise<RequestOutput> {
        const { namespace, name } = extractNameNamespace(specifier);
        const { result, metadata, success, diagnostics } = await compile({
            ...compilerConfig,
            name,
            namespace
        });
        return {
            type: RequestOutputTypes.COMPONENT,
            specifier,
            resource: result,
            metadata: new CompilerResourceMetadata(metadata),
            success,
            diagnostics
        };
    }

    toSpecifier(url: string): string {
        const { namespace, name } = this.parseUrl(url);
        return namespace ? `${namespace}/${name}` : name;
    }
}

function extractNameNamespace(specifier: string) {
    let [namespace, name] = specifier.split('/');
    if (!name) {
        // non-namespaced module such as 'wire-service'
        name = namespace;
        namespace = '';
    }

    return {
        name,
        namespace
    };
}

function computeMappings(modules: Module[], mappings: { [key: string]: any }) {
    for (const module of modules) {
        const { name, namespace, specifier } = module;
        if (name && namespace) {
            mappings[
                `${namespace}/${name}`
            ] = `${URI_PREFIX}/:uid/:mode/:locale/${namespace}/${name}`;
        } else if (specifier) {
            mappings[
                `${specifier}`
            ] = `${URI_PREFIX}/:uid/:mode/:locale/${specifier}`;
        }
    }

    MODULE_EXCLUSIONS.forEach(exclusion => {
        if (mappings.hasOwnProperty(exclusion)) {
            delete mappings[exclusion];
        }
    });

    return mappings;
}

function resolveAllModules(
    projectDir: string,
    moduleDir: string | undefined,
    customModuleDirs: string[]
) {
    const installedModules = resolveModules({
        rootDir: projectDir,
        modules: moduleDir ? [moduleDir, ...customModuleDirs] : customModuleDirs
    });
    return installedModules.map(item => {
        const { name, namespace } = extractNameNamespace(item.specifier);
        return { ...item, name, namespace };
    });
}

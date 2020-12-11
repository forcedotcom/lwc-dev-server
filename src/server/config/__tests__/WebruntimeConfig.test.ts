/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'path';
import WebruntimeConfig from '../WebruntimeConfig';
import Project from '../../../common/Project';
import { PublicConfig } from '@webruntime/api';
import { Plugin } from 'rollup';
import { ImportMapService, AppBootstrapService } from '@webruntime/services';
import { ApexService, SchemaService } from '@communities-webruntime/services';
import { ResourceUrlService } from '../../services/ResourceUrlService';
import { ApexContinuationService } from '../../services/ApexContinuationService';
import { ServerConfiguration } from '../../../common/types';

jest.mock('../../../common/Project');
const SRV_CONFIG: ServerConfiguration = {
    apiVersion: '49.0',
    instanceUrl: 'http://test.instance.url',
    headers: ['Authorization: Bearer testingAccessToken']
};

describe('WebruntimeConfig', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject', SRV_CONFIG);
    });

    it('should build from a base config', () => {
        const config = new WebruntimeConfig(project);

        expect(config.server.resourceRoot).toEqual('/webruntime');
    });

    it('should set directories based on the project', () => {
        const config = new WebruntimeConfig(project);

        const { moduleDir, buildDir } = config;

        expect(moduleDir).toEqual('src/modules');
        expect(buildDir).toEqual(
            path.join('/Users/arya/dev/myproject', '.localdevserver')
        );
    });

    it('should use port from project configurations', () => {
        const config = new WebruntimeConfig(project);

        expect(config.server.port).toEqual(3000);
    });

    describe('default services', () => {
        it('should include ImportMapService', () => {
            const config = new WebruntimeConfig(project);
            expect(config.services).toContain(ImportMapService);
        });

        it('should include AppBootstrapService', () => {
            const config = new WebruntimeConfig(project);
            expect(config.services).toContain(AppBootstrapService);
        });

        it('should include ApexService', () => {
            const config = new WebruntimeConfig(project);
            expect(config.services).toContain(ApexService);
        });

        it('should include SchemaService', () => {
            const config = new WebruntimeConfig(project);
            expect(config.services).toContain(SchemaService);
        });

        it('should include ApexContinuationService', () => {
            const config = new WebruntimeConfig(project);
            expect(config.services).toContain(ApexContinuationService);
        });

        it('should include ResourceUrlService', () => {
            const config = new WebruntimeConfig(project);
            expect(config.services).toContain(ResourceUrlService);
        });
    });

    describe('addMiddleware', () => {
        it('should prepend server extensions', () => {
            const extension = {
                extendApp: () => {}
            };

            const config = new WebruntimeConfig(project);

            config.server.extensions = [
                {
                    bootstrap: () => {}
                }
            ];

            config.addMiddleware([extension]);

            const { extensions } = config.server;

            expect(extensions).toHaveLength(2);
            expect(extensions[0]).toBe(extension);
        });
    });

    describe('addRoutes', () => {
        it('should append server extensions', () => {
            const extension = {
                extendApp: () => {}
            };

            const config = new WebruntimeConfig(project);

            config.server.extensions = [
                {
                    bootstrap: () => {}
                }
            ];

            config.addRoutes([extension]);

            const { extensions } = config.server;

            expect(extensions).toHaveLength(2);
            expect(extensions[1]).toBe(extension);
        });
    });

    describe('addModules', () => {
        it('should append lwc modules', () => {
            const config = new WebruntimeConfig(project);

            config.addModules(['module1', 'module2']);

            // @ts-ignore
            const { modules } = config.compilerConfig.lwcOptions;

            expect(modules).toHaveLength(2);
            expect(modules).toContain('module1');
            expect(modules).toContain('module2');
        });

        it('should handle config with undefined lwcOptions', () => {
            const config = new WebruntimeConfig(project);

            delete config.compilerConfig.lwcOptions;

            config.addModules(['module1', 'module2']);

            // @ts-ignore
            const { modules } = config.compilerConfig.lwcOptions;

            expect(modules).toHaveLength(2);
            expect(modules).toContain('module1');
            expect(modules).toContain('module2');
        });
    });

    describe('addPlugins', () => {
        let plugin: Plugin;

        beforeEach(() => {
            plugin = {
                name: 'testPlugin'
            };
        });

        it('should append compiler plugins', () => {
            const config = new WebruntimeConfig(project);

            config.compilerConfig.plugins = [];

            config.addPlugins([plugin]);

            const { plugins } = config.compilerConfig;

            expect(plugins).toHaveLength(1);
            // @ts-ignore
            expect(plugins[0]).toBe(plugin);
        });

        it('should handle config with undefined plugins', () => {
            const config = new WebruntimeConfig(project);

            delete config.compilerConfig.plugins;

            config.addPlugins([plugin]);

            const { plugins } = config.compilerConfig;

            expect(plugins).toHaveLength(1);
            // @ts-ignore
            expect(plugins[0]).toBe(plugin);
        });
    });

    describe('addServices', () => {
        it('should append services', () => {
            const testService = class TestService {
                constructor(serviceConfig: PublicConfig) {}
                async initialize() {}
                async shutdown() {}
                getPlugin() {
                    return {
                        name: 'testPlugin'
                    };
                }
            };

            const config = new WebruntimeConfig(project);

            config.addServices([testService]);

            expect(config.services).toContain(testService);
        });
    });
});

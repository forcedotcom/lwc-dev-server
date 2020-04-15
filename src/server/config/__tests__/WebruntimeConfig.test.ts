import path from 'path';
import WebruntimeConfig from '../WebruntimeConfig';
import Project from '../../../common/Project';
import { PublicConfig } from '@webruntime/api';
import { Plugin } from 'rollup';

jest.mock('../../../common/Project');

describe('WebruntimeConfig', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject');
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
    });

    describe('addPlugins', () => {
        it('should append compiler plugins', () => {
            const plugin: Plugin = {
                name: 'testPlugin'
            };

            const config = new WebruntimeConfig(project);

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

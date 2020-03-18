import path from 'path';
import WebruntimeConfig from '../WebruntimeConfig';
import Project from '../../../common/Project';

jest.mock('../../../common/Project');

describe('WebruntimeConfig', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject');
    });

    it('should build from a base config', () => {
        const base = {
            server: {
                resourceRoot: '/webruntime'
            }
        };

        const config = new WebruntimeConfig(base, project);

        expect(config.server.resourceRoot).toEqual('/webruntime');
    });

    it('should set directories based on the project', () => {
        const config = new WebruntimeConfig({}, project);

        const { moduleDir, buildDir } = config;

        expect(moduleDir).toEqual('/Users/arya/dev/myproject');
        expect(buildDir).toEqual(
            path.join('/Users/arya/dev/myproject', '.localdevserver')
        );
    });

    it('should use port from project configurations', () => {
        const config = new WebruntimeConfig({}, project);

        expect(config.server.port).toEqual('3000');
    });

    describe('addMiddleware', () => {
        it('should prepend server extensions', () => {
            const extension = {
                extendApp: () => {}
            };

            const config = new WebruntimeConfig(
                {
                    server: {
                        extensions: [
                            {
                                extendApp: () => {},
                                bootstrap: () => {}
                            }
                        ]
                    }
                },
                project
            );

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

            const config = new WebruntimeConfig(
                {
                    server: {
                        extensions: [
                            {
                                extendApp: () => {},
                                bootstrap: () => {}
                            }
                        ]
                    }
                },
                project
            );

            config.addRoutes([extension]);

            const { extensions } = config.server;

            expect(extensions).toHaveLength(2);
            expect(extensions[1]).toBe(extension);
        });
    });

    describe('addModules', () => {
        it('should append lwc modules', () => {
            const config = new WebruntimeConfig({}, project);

            config.addModules(['module1', 'module2']);

            const { modules } = config.compilerConfig.lwcOptions;

            expect(modules).toHaveLength(2);
            expect(modules).toContain('module1');
            expect(modules).toContain('module2');
        });
    });

    describe('addPlugins', () => {
        it('should append compiler plugins', () => {
            const plugin = {
                name: 'test-plugin',
                resolveId: () => {}
            };

            const config = new WebruntimeConfig({}, project);

            config.addPlugins([plugin]);

            const { plugins } = config.compilerConfig;

            expect(plugins).toHaveLength(1);
            expect(plugins[0]).toBe(plugin);
        });
    });
});

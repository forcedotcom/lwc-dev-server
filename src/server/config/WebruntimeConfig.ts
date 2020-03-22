import path from 'path';
import Project from '../../common/Project';
import { LocalDevApp } from './LocalDevApp';

const {
    ComponentService,
    ImportMapService,
    AppBootstrapService
} = require('@webruntime/services');

export default class WebruntimeConfig {
    /** Root project directory */
    projectDir: string;
    /** Default directory for the build output */
    buildDir: string;
    /** Defines the directory where to find the individual modules. */
    moduleDir?: string;
    /** Runtime server settings */
    server: any;
    /** Runtime application configuration */
    app?: any;
    /** Array of addressable services used by the container. */
    services: any[];
    /** A list of resources which should bundle their dependencies on request. */
    bundle: any[];
    /** A list of modules to be treated as external, and preloaded during bootstrap */
    preloadModules: string[];
    /** A list of module specifiers which are provided external to the webruntime compiler/bundler. */
    externals?: string[];
    /** Compiler options including -- the list of resources to inline during compiliation. */
    compilerConfig: any;

    constructor(baseConfig: any, project: Project) {
        Object.assign(this, baseConfig);

        this.projectDir = path.join(__dirname, '..', '..', '..');
        this.buildDir = path.join(project.directory, '.localdevserver');
        this.moduleDir = project.modulesSourceDirectory;

        this.server = {
            ...baseConfig.server,
            port: project.configuration.port.toString()
        };

        this.app = {
            defaultComponent: 'localdevserver/app',
            defaultTemplate: path.join(
                this.projectDir,
                'src/client/index.html'
            ),
            definition: LocalDevApp
        };

        this.services = [
            ComponentService,
            ImportMapService,
            AppBootstrapService
        ];

        this.bundle = ['@webruntime/app', 'webruntime_navigation/*'];

        this.preloadModules = [];

        this.externals = ['webruntime_loader/loader'];

        this.compilerConfig = {
            ...baseConfig.compilerConfig,
            formatConfig: {
                amd: { define: 'Webruntime.define' }
            },
            lwcOptions: {
                experimentalDynamicComponent: {
                    loader: 'webruntime_loader/loader',
                    strictSpecifier: false
                },
                modules: []
            },
            plugins: [],
            inlineConfig: [
                {
                    descriptor: '*/*',
                    exclude: ['lwc', 'wire-service']
                }
            ]
        };
    }

    /**
     * Prepend the LWR server extensions with middleware
     * @param middleware - An array of LWR extensions
     */
    addMiddleware(middleware: any[]) {
        this.server.extensions = [...middleware, ...this.server.extensions];
    }

    /**
     * Append the LWR server extensions with routes
     * @param routes - An array of LWR extensions
     */
    addRoutes(routes: any[]) {
        this.server.extensions = [...this.server.extensions, ...routes];
    }

    /**
     * Add LWC module paths to the LWR compiler configuration
     * @param modules - An array of paths to LWC components
     */
    addModules(modules: string[]) {
        this.compilerConfig.lwcOptions.modules = [
            ...this.compilerConfig.lwcOptions.modules,
            ...modules
        ];
    }

    /**
     * Add rollup plugins to the LWR compiler configuration
     * @param plugins - An array of rollup plugins
     */
    addPlugins(plugins: any[]) {
        this.compilerConfig.plugins = [
            ...this.compilerConfig.plugins,
            ...plugins
        ];
    }

    /**
     * Add AddressableService classes to the LWR configuration.
     * @param services - An array of service classes.
     */
    addServices(services: any[]) {
        this.services = [...this.services, ...services];
    }
}

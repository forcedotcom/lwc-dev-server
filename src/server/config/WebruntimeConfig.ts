import path from 'path';
import Project from '../../common/Project';
import { LocalDevApp } from './LocalDevApp';
import {
    Config,
    ApplicationConfig,
    CompilerConfig,
    BundleConfigEntry,
    CompileMode,
    ServiceDefinitionCtor,
    ContainerAppExtension
} from '@webruntime/api';
import { ImportMapService, AppBootstrapService } from '@webruntime/services';
import { Plugin } from 'rollup';
import { ApexService, SchemaService } from '@communities-webruntime/services';
import { ResourceUrlService } from '../services/ResourceUrlService';
import alias from '@rollup/plugin-alias';

export default class WebruntimeConfig implements Config {
    /** Root project directory */
    projectDir: string;
    /** Default directory for the build output */
    buildDir: string;
    /** Defines the directory where to find the individual modules. */
    moduleDir?: string;
    /** Runtime server settings */
    server: any;
    /** Runtime application configuration */
    app?: ApplicationConfig;
    /** Array of addressable services used by the container. */
    services: ServiceDefinitionCtor[];
    /** A list of resources which should bundle their dependencies on request. */
    bundle: BundleConfigEntry[];
    /** A list of modules to be treated as external, and preloaded during bootstrap */
    preloadModules: string[];
    /** A list of module specifiers which are provided external to the webruntime compiler/bundler. */
    externals?: string[];
    /** Compiler options including -- the list of resources to inline during compiliation. */
    compilerConfig: CompilerConfig;
    /** Default mode for LWR runtime and compiler, must be one of [CompileMode](docs/enums/_config_.compilemode) */
    defaultMode: CompileMode;
    // TODO enums for locales
    /** Default locale for LWR runtime and compiler */
    defaultLocale: string;

    constructor(project: Project) {
        this.projectDir = path.join(__dirname, '..', '..', '..');
        this.buildDir = path.join(project.directory, '.localdevserver');
        this.moduleDir = project.modulesSourceDirectory;

        this.defaultMode = CompileMode.dev;
        this.defaultLocale = 'en_US';

        this.server = {
            port: project.configuration.port,
            resourceRoot: '/webruntime',
            basePath: '',
            extensions: []
        };

        this.app = {
            defaultComponent: 'localdevserver/app',
            defaultTemplate: path.join(this.projectDir, 'client', 'index.html'),
            definition: LocalDevApp
        };

        this.services = [
            ImportMapService,
            AppBootstrapService,
            ApexService,
            SchemaService,
            ResourceUrlService
        ];

        this.bundle = [
            '@webruntime/app',
            'webruntime_navigation/*',
            'lightning/configProvider'
        ];

        this.preloadModules = [];

        // these modules are provided by the Webruntime App(defined above) or other external sources.
        // webruntime compiler should not attempt to resolve these against a service.
        // '@app' modules are defined in the LocalDevApp experimental scripts
        this.externals = [
            'webruntime_loader/loader',
            '@app/basePath',
            '@app/csrfToken'
        ];

        this.compilerConfig = {
            formatConfig: {
                amd: { define: 'Webruntime.define' }
            },
            lwcOptions: {
                exclude: [/@salesforce\/(?!lwc-dev-server).*/],
                experimentalDynamicComponent: {
                    loader: 'webruntime_loader/loader',
                    strictSpecifier: false
                },
                modules: []
            },
            plugins: [
                alias({
                    entries: [
                        // Used by talon-connect-gen. Once we use off-core LDS we can remove this.
                        {
                            find: 'transport',
                            replacement: 'webruntime/transport'
                        }
                    ]
                })
            ],
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
    addMiddleware(middleware: ContainerAppExtension[]) {
        this.server.extensions = [...middleware, ...this.server.extensions];
    }

    /**
     * Append the LWR server extensions with routes
     * @param routes - An array of LWR extensions
     */
    addRoutes(routes: ContainerAppExtension[]) {
        this.server.extensions = [...this.server.extensions, ...routes];
    }

    /**
     * Add LWC module paths to the LWR compiler configuration
     * @param modules - An array of paths to LWC components
     */
    addModules(modules: string[]) {
        if (!this.compilerConfig.lwcOptions) {
            this.compilerConfig.lwcOptions = {};
        }

        if (!this.compilerConfig.lwcOptions.modules) {
            this.compilerConfig.lwcOptions.modules = [];
        }

        this.compilerConfig.lwcOptions.modules = [
            ...this.compilerConfig.lwcOptions.modules,
            ...modules
        ];
    }

    /**
     * Add rollup plugins to the LWR compiler configuration
     * @param plugins - An array of rollup plugins
     */
    addPlugins(plugins: Plugin[]) {
        if (!this.compilerConfig.plugins) {
            this.compilerConfig.plugins = [];
        }

        this.compilerConfig.plugins = [
            ...this.compilerConfig.plugins,
            ...plugins
        ];
    }

    /**
     * Add AddressableService classes to the LWR configuration.
     * @param services - An array of service classes.
     */
    addServices(services: ServiceDefinitionCtor[]) {
        this.services = [...this.services, ...services];
    }
}

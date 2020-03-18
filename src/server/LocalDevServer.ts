import path from 'path';
import fs from 'fs';
import uuidv4 from 'uuidv4';
import Project from '../common/Project';
import { LocalDevApp } from './LocalDevApp';
import { customComponentPlugin } from './plugins/custom-components';
import { SessionNonce } from './extensions/SessionNonce';
import { ProjectMetadata } from './extensions/ProjectMetadata';
import { LiveReload } from './extensions/LiveReload';

const { Server, Container } = require('@webruntime/server');

const {
    ComponentService,
    ImportMapService,
    AppBootstrapService
} = require('@webruntime/services');

export { Server };

export default class LocalDevServer extends Server {
    private project: Project;
    private readonly sessionNonce: string;

    constructor(project: any) {
        // create default LWR server and override config/options
        super();

        this.sessionNonce = uuidv4();
        this.project = project;

        let vendorVersion = project.configuration.core_version;
        const supportedCoreVersions = this.getSupportedCoreVersions();

        if (!supportedCoreVersions.includes(vendorVersion)) {
            // fallback to latest support core version
            vendorVersion =
                supportedCoreVersions[supportedCoreVersions.length - 1];
        }

        const config = {
            ...this.config,
            server: {
                ...this.config.server,
                port: project.configuration.port.toString() || '3333',
                extensions: [
                    SessionNonce(this.sessionNonce),
                    ProjectMetadata(this.sessionNonce, this.project),
                    LiveReload(
                        path.join(
                            __dirname,
                            '..',
                            '..',
                            'cache-data',
                            'metadata.json'
                        )
                    )
                ]
            },

            projectDir: path.join(__dirname, '..', '..'),
            buildDir: path.join(project.directory, '.localdevserver'),
            moduleDir: project.directory,

            app: {
                defaultComponent: 'localdevserver/app',
                defaultTemplate: path.join(
                    __dirname,
                    '..',
                    '..',
                    'src/client/index.html'
                ),
                definition: LocalDevApp
            },

            services: [ComponentService, ImportMapService, AppBootstrapService],

            // Bundle the main application (ie: @webruntime/app),
            //      so it will include dependencies such as lwc all in one request
            bundle: ['@webruntime/app'],

            // The loader is always included in the webruntime shim,
            //      so it can be ignored by subsequent bundles
            externals: ['webruntime_loader/loader'],

            compilerConfig: {
                ...this.config.compilerConfig,
                formatConfig: { amd: { define: 'Webruntime.define' } },
                lwcOptions: {
                    modules: [
                        `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${vendorVersion}/lightning-pkg`,
                        `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${vendorVersion}/force-pkg`
                    ]
                },
                plugins: [
                    // The project is expected to be a SFDX project which means the LWC
                    //      components will be in the 'lwc' directory.
                    customComponentPlugin(
                        project.configuration.namespace,
                        'lwc',
                        path.join(
                            project.modulesSourceDirectory,
                            'main',
                            'default'
                        )
                    )
                ],

                // Ensure the lwc framework does not get re-bundled outside
                //      of the main application bundle (ie: @webruntime/app)
                inlineConfig: [
                    {
                        descriptor: '*/*',
                        exclude: ['lwc', 'wire-service']
                    }
                ]
            }
        };

        const options = {
            basePath: '',
            projectDir: path.join(__dirname, '..', '..'),
            port: project.configuration.port.toString() || '3333',
            resourceRoot: '/webruntime'
        };

        // override LWR defaults
        this.config = config;
        this.options = options;
        this.container = new Container(this.config);
    }

    /**
     * Get supported core versions of vendored modules
     */
    getSupportedCoreVersions() {
        const vendoredModulesPath = path.join(
            __dirname,
            '..',
            '..',
            'node_modules',
            '@salesforce',
            'lwc-dev-server-dependencies',
            'vendors'
        );

        const vendoredModules = fs.readdirSync(vendoredModulesPath);

        return vendoredModules.map(module => {
            return module.split('-')[1];
        });
    }
}

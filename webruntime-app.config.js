const path = require('path');

const {
    ComponentService,
    ImportMapService,
    AppBootstrapService
} = require('@webruntime/services');

const {
    customComponentPlugin
} = require('./dist/server/plugins/custom-components');

const { LocalDevApp } = require('./dist/server/LocalDevApp');

module.exports = {
    server: {
        port: parseInt(process.env.LOCALDEV_PORT)
    },

    // Store the built components in the project directory
    buildDir: path.join(process.env.PROJECT_ROOT, '.localdevserver'),

    // Modules provided by lwc-dev-server
    moduleDir: 'src/client/modules',

    // Application component and template provided by lwc-dev-server
    app: {
        defaultComponent: 'localdevserver/app',
        defaultTemplate: 'src/client/index.html',
        definition: LocalDevApp
    },

    // LWR services to provide components, an import map, and bootstrapping
    services: [ComponentService, ImportMapService, AppBootstrapService],

    // Bundle the main application (ie: @webruntime/app),
    //      so it will include dependencies such as lwc all in one request
    bundle: ['@webruntime/app'],

    // The loader is always included in the webruntime shim,
    //      so it can be ignored by subsequent bundles
    externals: ['webruntime_loader/loader'],

    compilerConfig: {
        // Use the LWR loader
        formatConfig: { amd: { define: 'Webruntime.define' } },

        plugins: [
            // The project is expected to be a SFDX project which means the LWC
            //      components will be in the 'lwc' directory.
            customComponentPlugin(
                process.env.PROJECT_NAMESPACE,
                'lwc',
                process.env.PROJECT_LWC_MODULES
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

import path from 'path';
import fs from 'fs';
import uuidv4 from 'uuidv4';
import Project from '../common/Project';
import WebruntimeConfig from './config/WebruntimeConfig';
import { sessionNonce, projectMetadata, liveReload } from './extensions';
import { getCustomComponentService } from './services/CustomComponentService';

const { Server, Container } = require('@webruntime/server');

export { Server, Container };

export default class LocalDevServer extends Server {
    private rootDir: string;
    private project: Project;
    private readonly sessionNonce: string;
    private readonly vendorVersion: string | undefined;

    constructor(project: Project) {
        // create a default LWR server
        super();

        this.rootDir = path.join(__dirname, '..', '..');
        this.project = project;
        this.sessionNonce = uuidv4();
        this.vendorVersion = project.configuration.core_version;

        const supportedCoreVersions = this.getSupportedCoreVersions();
        if (
            !this.vendorVersion ||
            !supportedCoreVersions.includes(this.vendorVersion)
        ) {
            // fallback to latest support core version
            this.vendorVersion =
                supportedCoreVersions[supportedCoreVersions.length - 1];
        }

        const options = {
            basePath: '',
            projectDir: this.rootDir,
            port: project.configuration.port.toString(),
            resourceRoot: '/webruntime'
        };

        const config = new WebruntimeConfig(this.config, this.project);

        config.addMiddleware([sessionNonce(this.sessionNonce)]);

        config.addRoutes([
            projectMetadata(this.sessionNonce, this.project),
            liveReload(path.join(this.rootDir, 'cache-data', 'metadata.json'))
        ]);

        config.addModules([
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/lightning-pkg`,
            `@salesforce/lwc-dev-server-dependencies/vendors/dependencies-${this.vendorVersion}/force-pkg`
        ]);

        if (this.project.isSfdx) {
            const CustomComponentService = getCustomComponentService(
                project.configuration.namespace,
                path.join(project.modulesSourceDirectory, 'main', 'default')
            );
            config.addServices([CustomComponentService]);
        }

        // override LWR defaults
        this.options = options;
        this.config = config;
        this.container = new Container(this.config);
    }

    /**
     * Get supported core versions of vendored modules
     */
    private getSupportedCoreVersions() {
        const vendoredModulesPath = path.join(
            this.rootDir,
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

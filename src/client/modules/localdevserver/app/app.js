import { LightningElement, register } from 'lwc';
import { registerWireService } from 'wire-service';
import { createRouter } from 'webruntime_navigation/navigation';
import lightningNavigation from 'webruntime_navigation/lightningNavigation';
import * as aura from 'webruntime/aura';
import auraStorage from 'webruntime/auraStorage';
import * as logger from 'webruntime/logger';
import * as auraInstrumentation from 'localdevserver/instrumentation';
import * as lightningConfigProvider from 'localdevserver/lightningConfigProvider';
import { routes } from 'localdevserver/routerLib';
import configProviderService from 'lightning/configProvider';

registerWireService(register);

configProviderService(lightningConfigProvider);

createRouter({ routes })
    .addErrorNavigate(e => {
        console.error(
            `There was a problem during navigation: ${e.code} :: ${e.message}`
        );
    })
    .connect();

export default class LocalDevServerApp extends LightningElement {
    constructor() {
        super();

        this.defineModules({
            // Modules referenced by LDS from core. Some of these may be removable once we
            // switch to off-core LDS.
            aura,
            logger,
            'aura-instrumentation': auraInstrumentation,
            'aura-storage': auraStorage,
            'instrumentation/service': auraInstrumentation,
            'lightning/navigation': lightningNavigation,

            // Hardcoded values for salesforce-scoped imports. As these modules
            // become officially supported they can be removed from here. We
            // could also do this through stub implementations too.
            '@salesforce/user/isGuest': true,
            '@salesforce/user/Id': '',
            '@salesforce/client/formFactor': 'Large'
        });
    }

    /**
     * Define AMD modules using Webruntime's loader.
     *
     * @param {Object.<string, module>} modules - An object where the key is the
     * module id and the value is the module or return value.
     */
    defineModules(modules) {
        if (!window.Webruntime || !window.Webruntime.define) {
            throw new Error('Webruntime.define is not defined');
        }

        Object.entries(modules).forEach(([name, value]) => {
            window.Webruntime.define(name, [], () => value);
        });
    }
}

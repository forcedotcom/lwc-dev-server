import { LightningElement, register } from 'lwc';
import { registerWireService } from 'wire-service';
import { createRouter } from 'webruntime_navigation/navigation';
import { routes } from 'localdevserver/routerLib';

import { defineModules } from 'webruntime_loader/loader';
import * as auraInstrumentation from 'webruntime/auraInstrumentation';
import * as transport from 'webruntime/transport';
import * as logger from 'webruntime/logger';
import * as webruntimeAura from 'webruntime/aura';
import auraStorage from 'webruntime/auraStorage';

defineModules({
    'aura-instrumentation': auraInstrumentation,
    'aura-storage': auraStorage,
    'instrumentation/service': auraInstrumentation,
    aura: webruntimeAura,
    transport,
    logger
});

registerWireService(register);

createRouter({ routes })
    .addErrorNavigate(e => {
        console.error(
            `There was a problem during navigation: ${e.code} :: ${e.message}`
        );
    })
    .connect();

export default class LocalDevServerApp extends LightningElement {}

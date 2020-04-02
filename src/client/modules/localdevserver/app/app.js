import { LightningElement, register } from 'lwc';
import { registerWireService } from 'wire-service';
import { createRouter } from 'webruntime_navigation/navigation';
import { routes } from 'localdevserver/routerLib';

registerWireService(register);

createRouter({ routes })
    .addErrorNavigate(e => {
        console.error(
            `There was a problem during navigation: ${e.code} :: ${e.message}`
        );
    })
    .connect();

export default class LocalDevServerApp extends LightningElement {}

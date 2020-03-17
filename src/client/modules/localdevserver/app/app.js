import { LightningElement, register } from 'lwc';
import { registerWireService } from 'wire-service';
import { createRouter } from 'webruntime_navigation/navigation';

import routes from './routes';

registerWireService(register);

const router = createRouter({ routes });

router.addPostNavigate(data => {
    console.debug('post navigate event', data);
});

router.addErrorNavigate(e => {
    console.error(
        `There was a problem during navigation: ${e.code} :: ${e.message}`
    );
});

router.connect();

export default class LocalDevServerApp extends LightningElement {}

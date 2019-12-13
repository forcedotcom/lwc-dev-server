import { LightningElement } from 'lwc';

export default class AutoReloadTest extends LightningElement {
    get currentTime() {
        return new Date().toISOString();
    }
}

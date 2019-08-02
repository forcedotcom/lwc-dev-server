import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api label;
    @api href;
    @api type;
    @api hideContent = false;
}

import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api href;
    @api label;
    @api variant;
    @api error;
}

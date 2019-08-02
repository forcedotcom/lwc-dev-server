import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api title;
    @api iconName;
    @api variant;
}

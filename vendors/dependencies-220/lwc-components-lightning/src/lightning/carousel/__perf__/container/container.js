import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api disableAutoRefresh;
    @api disableAutoScroll;
    @api moreItems = false;
}

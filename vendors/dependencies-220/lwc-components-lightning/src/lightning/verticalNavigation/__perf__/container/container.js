import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api sections = [];
    @api overflows = [];
    @api selectedItem;

    @api
    clickFirstOverflow() {
        const button = this.template
            .querySelector('lightning-vertical-navigation-overflow')
            .shadowRoot.querySelector('button');
        button.click();
    }
}

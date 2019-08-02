import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api label;
    @api iconName;
    @api iconSize;
    @api variant;
    @api isDraft;
    @api isLoading;
    @api showSubheader;
    @api showMenuDivider;
    @api menuAlignment;

    @api privateMenuItems = [];

    @api
    click() {
        this.template.querySelector('lightning-button-menu').click();
    }

    @api
    clickItem(item) {
        this.template
            .querySelector('lightning-menu-item:nth-of-type(' + item + ')')
            .click();
    }
}

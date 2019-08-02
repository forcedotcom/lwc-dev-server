import { LightningElement, track } from 'lwc';

export default class ButtonMenu extends LightningElement {
    @track
    privateMenuItems = [
        {
            class: 'menu-item-1',
            label: 'Chat customer',
            value: 'alpha',
            iconName: 'utility:kanban',
            prefixIconName: 'utility:chat',
            href: '',
            isDraft: 'true',
            draftAlternativeText: 'Menu not saved',
            checked: true,
        },
        {
            class: 'menu-item-2',
            label: 'Beta',
            value: 'beta',
            iconName: '',
            prefixIconName: '',
            href: '',
            isDraft: false,
            draftAlternativeText: 'Item not saved',
            checked: false,
        },
        {
            class: 'menu-item-3',
            label: 'Gamma',
            value: 'gamma',
            iconName: '',
            prefixIconName: '',
            href: 'https://google.com',
            isDraft: true,
            draftAlternativeText: 'Item not saved',
            checked: false,
        },
    ];

    handleSelect(event) {
        const selectedItemValue = event.detail.value;
        const menuItem = this.privateMenuItems.find(item => {
            return item.value === selectedItemValue;
        });

        menuItem.checked = !menuItem.checked;
    }
}

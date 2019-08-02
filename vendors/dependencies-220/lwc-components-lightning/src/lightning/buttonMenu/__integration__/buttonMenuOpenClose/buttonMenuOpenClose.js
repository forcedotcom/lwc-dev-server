import { LightningElement, track } from 'lwc';

export default class ButtonMenu extends LightningElement {
    @track alignment = 'left';

    @track loading = true;

    @track privateMenuItems = [];

    handleOpen() {
        this.privateMenuItems = [
            {
                id: 'menu-item-1',
                label: 'Chat customer',
                value: 'alpha',
            },
            {
                id: 'menu-item-2',
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
                id: 'menu-item-3',
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
        this.loading = false;
    }

    changeAlignment() {
        if (this.alignment === 'left') {
            this.alignment = 'auto';
        } else {
            this.alignment = 'left';
        }
    }
}

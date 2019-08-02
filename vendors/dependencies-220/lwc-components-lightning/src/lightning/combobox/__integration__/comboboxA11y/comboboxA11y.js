import { LightningElement, api, track } from 'lwc';

export default class SingleSelectComboboxValue extends LightningElement {
    @track selectedOption = 'one';
    options = [
        {
            label: 'one',
            value: 'one',
        },
        {
            label: 'two',
            value: 'two',
        },
        {
            label: 'three',
            value: 'three',
        },
    ];

    handleChange(e) {
        this.selectedOption = e.detail.value;
    }
}

import { LightningElement, track, api } from 'lwc';

export default class InputCheckbox extends LightningElement {
    @track selected;
    @track value;

    options = [
        { label: 'Sales', value: 'option1' },
        { label: 'Force', value: 'option2' },
    ];

    handleChange(e) {
        this.selected = e.detail.value;
    }
}

import { LightningElement, track, api } from 'lwc';

export default class InputCheckbox extends LightningElement {
    @track isChecked;
    @track checkedViaClick;

    handleClick(e) {
        const input = document.querySelector('lightning-input');
        this.checkedViaClick = input.checked;
    }

    handleChange(e) {
        this.isChecked = e.detail.checked;
    }
}

import { LightningElement, track, api } from 'lwc';

export default class InputCheckbox extends LightningElement {
    @track isChecked = false;

    handleClick() {
        this.isChecked = !this.isChecked;
    }
}

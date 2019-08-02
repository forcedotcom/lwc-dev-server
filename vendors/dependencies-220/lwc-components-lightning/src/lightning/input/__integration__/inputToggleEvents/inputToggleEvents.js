import { LightningElement, track, api } from 'lwc';

export default class InputToggleEvents extends LightningElement {
    @track isChecked;
    @track checkedViaClick;

    handleClick(e) {
        const input = this.template.querySelector('lightning-input');
        this.checkedViaClick = input.checked;
    }

    handleChange(e) {
        this.isChecked = e.detail.checked;
    }
}

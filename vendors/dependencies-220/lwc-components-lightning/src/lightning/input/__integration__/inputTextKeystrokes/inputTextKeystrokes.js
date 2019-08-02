import { LightningElement, track } from 'lwc';

export default class InputTextKeystrokes extends LightningElement {
    @track firstName = '';
    @track lastName = '';

    setFirstInputValue() {
        this.firstName = 'Nihar';
    }

    handleChange1(event) {
        this.firstName = event.detail.value;
    }

    handleChange2(event) {
        this.lastName = event.detail.value;
    }
}

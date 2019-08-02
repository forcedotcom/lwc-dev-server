import { LightningElement, track } from 'lwc';

export default class InputBasicInteractions extends LightningElement {
    @track inputValue = '';

    handleChange(e) {
        this.inputValue = e.target.value;
    }
    handleCheckValueClick() {
        const input = this.template.querySelector('lightning-input');
        this.inputValue = input.value;
    }
}

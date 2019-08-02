import { LightningElement, track, api } from 'lwc';

export default class InputNumber extends LightningElement {
    @track step = 1;

    @track val;

    handleChange(e) {
        this.val = e.detail.value;
    }
}

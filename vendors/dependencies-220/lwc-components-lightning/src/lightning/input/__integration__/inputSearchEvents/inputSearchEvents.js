import { LightningElement, track } from 'lwc';

export default class InputSearchEvents extends LightningElement {
    @track out;

    handleChange(e) {
        this.out = e.detail.value;
    }
}

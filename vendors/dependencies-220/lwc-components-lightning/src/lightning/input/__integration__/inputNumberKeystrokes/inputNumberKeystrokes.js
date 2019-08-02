import { LightningElement, track, api } from 'lwc';

export default class InputNumber extends LightningElement {
    @track step = 1;

    handleClick() {
        this.step = 2;
    }
}

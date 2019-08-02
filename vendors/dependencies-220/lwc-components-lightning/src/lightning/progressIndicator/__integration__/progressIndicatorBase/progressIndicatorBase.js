import { LightningElement, track } from 'lwc';

export default class ProgressIndicatorBase extends LightningElement {
    @track current = 'step3';

    handleClick() {
        this.current = 'step4';
    }
}

import { LightningElement, track, wire } from 'lwc';
import startRequest from '@salesforce/apexContinuation/ApexContinuationClass.startRequest';
export default class ApexContinuation extends LightningElement {
    @track imperativeContinuation = {};

    // Using wire service
    @wire(startRequest)
    wiredContinuation;

    get formattedWireResult() {
        return JSON.stringify(this.wiredContinuation);
    }

    // Imperative Call
    callContinuation() {
        startRequest()
            .then((result) => {
                this.imperativeContinuation = result;
            })
            .catch((error) => {
                this.imperativeContinuation = error;
            });
    }

    get formattedImperativeResult() {
        return JSON.stringify(this.imperativeContinuation);
    }
}
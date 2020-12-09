import { LightningElement } from 'lwc';
import startContinuation from '@salesforce/apexContinuation/<Your Continuation Controller class>.<Your startContinuation method>';
 
export default class ApexContinuation extends LightningElement {
    result;
    isLoading = true;
 
    connectedCallback() {
        startContinuation()
            .then(result => {
                this.result = result;
                this.isLoading = false;
            }).catch(error => {
                // TODO: handle error
                this.isLoading = false;
            });
    }
}
import { LightningElement, track } from 'lwc';
import getContactList from '@salesforce/apex/ApexTestContactController.getContactList';

export default class ApexImperativeMethod extends LightningElement {
    @track contacts;
    @track error;

    handleLoad() {
        getContactList()
            .then(result => {
                this.contacts = result;
                this.error = undefined;
            })
            .catch(error => {
                this.error = JSON.stringify(error, null, 2);
                this.contacts = undefined;
            });
    }
}

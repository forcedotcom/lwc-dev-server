import { LightningElement, wire } from 'lwc';
import getContactList from '@salesforce/apex/ApexTestContactController.getContactList';

export default class Component extends LightningElement {
    @wire(getContactList) contacts;

    get error() {
        if (this.contacts.error) {
            return JSON.stringify(this.contacts.error);
        }
        return '';
    }
}

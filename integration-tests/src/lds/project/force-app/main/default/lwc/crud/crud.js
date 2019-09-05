import { LightningElement, track, wire } from 'lwc';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ID_FIELD from '@salesforce/schema/Account.Id';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import {
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    getFieldValue
} from 'lightning/uiRecordApi';

export default class Crud extends LightningElement {
    @track recordId;
    @track recordName;
    @track lastEdit;
    @track lastDelete;
    @track error;

    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
    wiredRecord;

    get wiredName() {
        return getFieldValue(this.wiredRecord.data, NAME_FIELD) || 'undefined';
    }

    create() {
        const nameValue = this.template.querySelector('.create-input').value;
        if (!nameValue) {
            throw new Error(
                'Cannot call create before setting value in the input field'
            );
        }

        const params = {
            apiName: ACCOUNT_OBJECT.objectApiName,
            fields: {
                [NAME_FIELD.fieldApiName]: nameValue
            }
        };

        createRecord(params)
            .then(record => {
                this.recordId = record.id;
                this.recordName = getFieldValue(record, NAME_FIELD);
            })
            .catch(error => {
                this.error = JSON.stringify(error, null, 2);
            });
    }

    edit() {
        const nameValue = this.template.querySelector('.edit-input').value;
        if (!nameValue) {
            throw new Error(
                'Cannot call edit without a valid value in the input field'
            );
        }
        if (!this.recordId || this.recordId === 'not-set') {
            throw new Error('cannot call edit when the recordId is not set');
        }

        const params = {
            fields: {
                [ID_FIELD.fieldApiName]: this.recordId,
                [NAME_FIELD.fieldApiName]: nameValue
            }
        };

        updateRecord(params)
            .then(record => {
                this.recordName = getFieldValue(record, NAME_FIELD);
                this.lastEdit = Date.now();
            })
            .catch(error => {
                this.error = JSON.stringify(error, null, 2);
            });
    }

    // short for delete, which is a keyword and not a good one for a function name
    delet() {
        deleteRecord(this.recordId)
            .then(() => {
                this.lastDelete = Date.now();
            })
            .catch(error => {
                this.error = JSON.stringify(error, null, 2);
            });
    }
}

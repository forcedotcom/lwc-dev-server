import { LightningElement, track } from 'lwc';
import {
    // getRecord, TODO - LDS does not support invoking getRecord directly, what do customers do?
    createRecord,
    updateRecord,
    deleteRecord
} from 'lightning/uiRecordApi';

export default class Hello extends LightningElement {
    @track readId = 'not-set';
    @track readData = 'not-set';

    create() {
        const nameValue = this.template.querySelector('.name-input').value;
        if (nameValue) {
            createRecord({
                apiName: 'Account',
                fields: { Name: nameValue }
            }).then(Account => {
                this.readId = Account.id;
                this.readData = Account.fields.Name.value;
            });
        }
    }

    // read() {
    //     getRecord()
    // }

    edit() {
        const valueInput = this.template.querySelector('.value-input').value;
        updateRecord({
            fields: {
                Id: this.readId,
                Name: valueInput
            }
        }).then(record => {
            this.readData = record.fields.Name.value;
        });
    }

    // short for delete, which is a keyword and not a good one for a function name
    delet() {
        deleteRecord(this.readId).then(() => {
            this.readId = 'deleted';
            this.readData = 'deleted';
        }); // TODO error handling?
    }
}

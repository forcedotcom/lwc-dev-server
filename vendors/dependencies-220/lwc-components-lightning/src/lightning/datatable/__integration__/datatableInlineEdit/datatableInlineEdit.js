import { LightningElement, track } from 'lwc';

const data = [
    {
        id: 1,
        name: 'John Snow',
        age: 30,
        email: 'john.snow@salesforce.com',
        createdAt: 'Tue, 13 Nov 2018 19:01:41 GMT',
    },
    {
        id: 2,
        name: 'Jamie Lanister',
        age: 35,
        email: 'jamie.lanister@salesforce.com',
        createdAt: 'Tue, 13 Nov 2018 19:01:41 GMT',
    },
    {
        id: 3,
        name: 'Arya Stark',
        age: 15,
        email: 'arya.stark@salesforce.com',
        createdAt: 'Tue, 13 Nov 2018 19:01:41 GMT',
    },
    {
        id: 4,
        name: 'Little Finger',
        age: 45,
        email: 'little.finger@salesforce.com',
        createdAt: 'Tue, 13 Nov 2018 19:01:41 GMT',
    },
];

const columns = [
    { label: 'Name', fieldName: 'name', editable: true },
    { label: 'Age', fieldName: 'age', type: 'number', editable: true },
    { label: 'Email', fieldName: 'email', type: 'email' },
    {
        label: 'created at',
        fieldName: 'createdAt',
        type: 'date',
        editable: true,
    },
];

export default class Button extends LightningElement {
    @track data = data;
    @track columns = columns;
    @track suppressBottomBar = false;
    @track keyCode;

    suppressBar() {
        this.suppressBottomBar = true;
    }

    handleKeydown() {
        this.keyCode = event.keyCode;
    }
}

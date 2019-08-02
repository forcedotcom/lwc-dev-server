import { LightningElement, track } from 'lwc';

const data = [
    { id: 1, name: 'John Snow', age: 30, email: 'john.snow@salesforce.com' },
    {
        id: 2,
        name: 'Jamie Lanister',
        age: 35,
        email: 'jamie.lanister@salesforce.com',
    },
    { id: 3, name: 'Arya Stark', age: 15, email: 'arya.stark@salesforce.com' },
    {
        id: 4,
        name: 'Little Finger',
        age: 45,
        email: 'little.finger@salesforce.com',
    },
];

const columns = [
    { label: 'Name', fieldName: 'name', editable: true },
    { label: 'Age', fieldName: 'age', type: 'number', editable: true },
    { label: 'Email', fieldName: 'email', type: 'email' },
];

export default class DataTable extends LightningElement {
    @track data = data;
    @track columns = columns;
}

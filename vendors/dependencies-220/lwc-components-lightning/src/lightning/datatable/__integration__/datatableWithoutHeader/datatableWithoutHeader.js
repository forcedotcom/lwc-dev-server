import { LightningElement, track } from 'lwc';

const columns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Name', fieldName: 'age', type: 'number' },
    { label: 'Name', fieldName: 'email', type: 'email' },
];
const data = [
    {
        id: 1,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 2,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 3,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 4,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 5,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 6,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 7,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 8,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 9,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 10,
        name: 'Reinier Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
];

export default class DatatableExample extends LightningElement {
    @track data = data;
    @track columns = columns;
}

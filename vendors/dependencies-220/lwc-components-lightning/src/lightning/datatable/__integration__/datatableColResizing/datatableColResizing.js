import { LightningElement, track } from 'lwc';

const data = [
    {
        id: 1,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 2,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 3,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 4,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 5,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 6,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
    {
        id: 7,
        name: 'Reineir Guerra',
        age: 35,
        email: 'reinier.guerra@salesforce.com',
    },
];

const columns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Age', fieldName: 'age', type: 'number' },
    { label: 'Email', fieldName: 'email', type: 'email' },
];

export default class DataTableResize extends LightningElement {
    @track data = data;
    @track columns = columns;
}

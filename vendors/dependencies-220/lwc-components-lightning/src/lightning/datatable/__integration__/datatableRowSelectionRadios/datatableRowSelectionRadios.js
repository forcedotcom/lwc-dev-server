import { LightningElement, track } from 'lwc';

const data = [
    { id: 1, name: 'John Snow' },
    { id: 2, name: 'Jamie Lanister' },
    { id: 3, name: 'Arya Stark' },
    { id: 4, name: 'Little Finger' },
];

const columns = [{ label: 'Name', fieldName: 'name', editable: true }];

export default class DataTableRowSelectRadios extends LightningElement {
    @track data = data;
    @track columns = columns;
}

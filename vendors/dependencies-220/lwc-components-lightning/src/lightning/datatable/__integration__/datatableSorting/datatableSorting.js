import { LightningElement, track } from 'lwc';

const data = [
    { id: 1, name: 'John Snow', age: 40, email: 'john.snow@salesforce.com' },
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
        age: 5,
        email: 'little.finger@salesforce.com',
    },
];

const columns = [
    { label: 'Name', fieldName: 'name', editable: true },
    {
        label: 'Age',
        sortable: true,
        fieldName: 'age',
        type: 'number',
        editable: true,
    },
    { label: 'Email', fieldName: 'email', type: 'email' },
];

export default class DemoApp extends LightningElement {
    @track data = data;
    @track columns = columns;
    @track defaultSortDirection = 'asc';
    @track sortDirection = 'asc';
    @track sortedBy;

    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        reverse !== reverse ? 1 : -1;

        return function(a, b) {
            return (a = key(a)), (b = key(b)), reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}

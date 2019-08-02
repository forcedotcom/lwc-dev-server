import { LightningElement, track } from 'lwc';

const columns = [
    {
        label: 'Ordering',
        fieldName: 'id',
        type: 'orderingButtons',
        typeAttributes: {
            isFirstRow: { fieldName: 'isFirstRow' },
            isLastRow: { fieldName: 'isLastRow' },
        },
        fixedWidth: 100,
    },
    { fieldName: 'name', label: 'Name' },
];

const data = [
    { id: 'a', name: 'Reinier Guerra', isFirstRow: true, isLastRow: false },
    { id: 'b', name: 'Jose Rodriguez', isFirstRow: false, isLastRow: false },
    { id: 'c', name: 'Gonzalo Cordero', isFirstRow: false, isLastRow: true },
];

export default class CustomDatatableItest extends LightningElement {
    @track columns = columns;
    @track data = data;
}

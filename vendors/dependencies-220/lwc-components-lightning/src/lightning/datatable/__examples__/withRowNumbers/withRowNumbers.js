import { LightningElement, track } from 'lwc';
import fetchDataHelper from './fetchDataHelper';

const columns = [
    { label: 'Label', fieldName: 'name' },
    { label: 'Website', fieldName: 'website', type: 'url' },
    { label: 'Phone', fieldName: 'phone', type: 'phone' },
    { label: 'Balance', fieldName: 'amount', type: 'currency' },
    { label: 'CloseAt', fieldName: 'closeAt', type: 'date' },
];

export default class BasicDatatable extends LightningElement {
    @track data = [];
    @track columns = columns;
    @track rowOffset = 0;

    async connectedCallback() {
        this.data = await fetchDataHelper({ amountOfRecords: 100 });
    }

    increaseRowOffset() {
        this.rowOffset += 100;
    }
}

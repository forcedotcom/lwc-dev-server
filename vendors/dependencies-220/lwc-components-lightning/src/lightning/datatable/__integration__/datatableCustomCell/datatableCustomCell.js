import { LightningElement, createElement } from 'lwc';
import ExtendedDatatable from './components/extendedDatatable/extendedDatatable';

const component = createElement('my-ext-datatable', { is: ExtendedDatatable });

component.keyField = 'id';
component.data = [
    { id: 'a', name: 'Reinier Guerra', age: 35 },
    { id: 'b', name: 'Reinier Guerra', age: 35 },
    { id: 'c', name: 'Reinier Guerra', age: 35 },
    { id: 'd', name: 'Reinier Guerra', age: 35 },
];

component.columns = [
    {
        type: 'text',
        fieldName: 'name',
        label: 'Full Name',
    },
    {
        type: 'age',
        fieldName: 'age',
        label: 'Age',
    },
];

export default class DatatableCustomCell extends LightningElement {
    renderTable() {
        const container = this.template.querySelector('.table-container');
        container.appendChild(component);
    }
}

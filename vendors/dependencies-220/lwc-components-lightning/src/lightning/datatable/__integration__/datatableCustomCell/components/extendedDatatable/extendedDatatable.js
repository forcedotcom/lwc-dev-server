import LightningDatatable from 'lightning/datatable';
import ageTpl from './age.html';

export default class ExtendedDatatable extends LightningDatatable {
    static customTypes = {
        age: {
            template: ageTpl,
        }
    }
}

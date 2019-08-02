import LightningDatatable from 'lightning/datatable';
import orderingButtons from './orderingButtons.html';

export default class ExtendedDatatable extends LightningDatatable {
    static customTypes = {
        orderingButtons: {
            template: orderingButtons,
            typeAttributes: ['isFirstRow', 'isLastRow'],
        },    
    }
}
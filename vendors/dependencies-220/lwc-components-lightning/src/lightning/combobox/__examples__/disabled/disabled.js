import { LightningElement, track } from 'lwc';

export default class ComboboxDisabled extends LightningElement {
    @track value = 'inProgress';

    get options() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }
}

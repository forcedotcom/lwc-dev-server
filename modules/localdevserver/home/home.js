import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Home extends LightningElement {
    @track _components = [];

    @track componentsFilter = '';

    @api
    get components() {
        if (this.componentsFilter) {
            return this._components.filter(item => {
                return item.title.toLowerCase().includes(this.componentsFilter);
            });
        }
        return this._components;
    }

    constructor() {
        super();

        // fetch data from the server
        fetch('/componentList')
            .then(async response => {
                if (response.ok) {
                    return response.json();
                }
                // we had some kind of error
                const text = await response.text();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: `Error ${response.status} loading components: ${text}`,
                        variant: 'error'
                    })
                );
                return [];
            })
            .then(data => {
                this._components = data;
            });
    }

    onSearchChange(e) {
        this.componentsFilter = e.srcElement.value.toLowerCase();
    }
}

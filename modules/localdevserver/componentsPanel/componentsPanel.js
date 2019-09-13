import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ComponentsPanel extends LightningElement {
    @track _components = [];

    @track componentsFilter = '';

    @track isSearching;

    @track projectName = 'Project Name';

    @api
    get components() {
        if (this.componentsFilter) {
            const normalizedFilter = this.componentsFilter
                .replace(/^c-/, '')
                .replace(/-/g, '');

            return this._components.filter(item => {
                return item.title.toLowerCase().includes(normalizedFilter);
            });
        }
        return this._components;
    }

    // get showPackages() {
    //     return true;
    // }

    get selectedPackage() {
        return 'package1'; // TODO
    }

    get componentsListLabel() {
        return this.isSearching ? 'Search Results' : 'All Components';
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
        this.isSearching = !!e.srcElement.value;
    }

    clearInput(event) {
        event.preventDefault();
        event.stopPropagation();
        const input = this.template.querySelector('.search-input');
        if (input) {
            input.value = '';
            input.focus();
            input.dispatchEvent(
                new CustomEvent('change', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        value: ''
                    }
                })
            );
        }
    }
}

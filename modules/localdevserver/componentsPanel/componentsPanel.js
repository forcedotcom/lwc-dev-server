import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ComponentsPanel extends LightningElement {
    @track projectName;
    @track _packages = [];
    @track _components = [];
    @track componentsFilter;
    @track searchInProgress;
    @track searchValue;
    _selectedPackage;

    get hasComponents() {
        return this._components && this._components.length > 0;
    }

    get hasVisibleComponents() {
        return this.components.length > 0;
    }

    get components() {
        if (this.componentsFilter) {
            // TODO: highlight part of search that matches
            const normalizedFilter = this.componentsFilter.toLowerCase();
            return this._components.filter(item => {
                const normalizedName = item.htmlName.toLowerCase();
                return normalizedName.includes(normalizedFilter);
            });
        }
        return this._components;
    }

    get componentsListLabel() {
        return this.searchInProgress ? 'Search Results' : 'All Components';
    }

    get searchDisabled() {
        return !this.hasComponents;
    }

    get hasPackages() {
        return this._packages && this._packages.length > 0;
    }

    get packages() {
        return this._packages;
    }

    set packages(packages) {
        this._packages = packages;
    }

    get selectedPackage() {
        return this._selectedPackage;
    }

    set selectedPackage(packageId) {
        this._selectedPackage = packageId;
        this._components = this.packages.find(
            pkg => pkg.key === this._selectedPackage
        ).components;
    }

    constructor() {
        super();

        // fetch data from the server
        // FIXME: this results in a UX flicker that could be improved
        fetch('/componentList')
            .then(async response => {
                if (response.ok) {
                    return response.json();
                }

                // we had some kind of error
                // TODO: does ShowToastEvent work?
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
                this.projectName = data.projectName;
                this.packages = data.packages;
                this.selectedPackage = this.packages[0].key;
            });
    }

    onSearchChange(e) {
        this.componentsFilter = e.srcElement.value.toLowerCase();
        this.searchInProgress = !!e.srcElement.value;
        this.searchValue = e.srcElement.value;
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

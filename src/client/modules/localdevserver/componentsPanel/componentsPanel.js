import { LightningElement, track } from 'lwc';
import { getProjectMetadata } from 'localdevserver/projectMetadataLib';

export default class ComponentsPanel extends LightningElement {
    @track projectName;
    @track _packages = [];
    @track _components = [];
    @track _selectedPackage;
    @track componentsFilter;
    @track searchInProgress;
    @track searchValue;

    get components() {
        if (this.componentsFilter) {
            // TODO: highlight part of search that matches
            const normalizedFilter = this.componentsFilter
                .replace(/-/g, '')
                .toLowerCase();

            return this._components.filter(item => {
                const normalizedName = item.htmlName
                    .replace(/-/g, '')
                    .toLowerCase();
                return normalizedName.includes(normalizedFilter);
            });
        }
        return this._components;
    }

    get hasComponents() {
        return this._components && this._components.length > 0;
    }

    get hasVisibleComponents() {
        return this.components.length > 0;
    }

    get componentsListLabel() {
        return this.searchInProgress ? 'Search Results' : 'All Components';
    }

    get searchDisabled() {
        return !this.hasComponents;
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

        getProjectMetadata().then(data => {
            this.projectName = data.projectName;
            this.packages = data.packages;
            if (this.packages.length) {
                this.selectedPackage = this.packages[0].key;
            }
        });
    }

    onSearchChange(e) {
        this.componentsFilter = e.srcElement.value.toLowerCase();
        this.searchInProgress = !!e.srcElement.value;
        this.searchValue = e.srcElement.value;
    }

    onNavigationSelect(e) {
        const selectedPackage = this.packages.find(selection => {
            return selection.key == e.detail.name;
        });
        this.selectedPackage = selectedPackage.key;
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

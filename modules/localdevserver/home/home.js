import { LightningElement, api, track } from 'lwc';

export default class Home extends LightningElement {
    configuration = `
{
    // What namespace to use referencing your Lightning Web Components
    "namespace": "c",

    // Which component is the default to preview.
    "main": "app",

    // Where are your component files. If you have a namespace,
    // specify the directory the namespace folder is in.
    "modulesSourceDirectory": "....",

    // The address port for your local server. Defaults to 3333
    "port": 3333
}
`;
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
            .then(function(response) {
                return response.json();
            })
            .then(data => {
                this._components = data;
            });
    }

    onSearchChange(e) {
        this.componentsFilter = e.srcElement.value.toLowerCase();
    }
}

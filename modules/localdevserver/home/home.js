import { LightningElement, api } from 'lwc';

export default class Home extends LightningElement {
    configuration = `
{
    // What namespace to use referencing your Lightning Web Components
    "namespace": "c",

    // Which component is the default to preview.
    "main": "app",

    // Where are your component files. If you have a namespace, 
    // specify the directory the namespace folder is in.
    "moduleSourceDirectory": "....",

    // Name of the component to load in the default container
    "main": "...",

    // The address port for your local server. Defaults to 3333
    "port": 3333
}
`;
    @api components = [];

    constructor() {
        super();

        // fetch data from the server
        fetch('/componentList')
            .then(function(response) {
                return response.json();
            })
            .then(data => {
                this.components = data;
            });
    }
}

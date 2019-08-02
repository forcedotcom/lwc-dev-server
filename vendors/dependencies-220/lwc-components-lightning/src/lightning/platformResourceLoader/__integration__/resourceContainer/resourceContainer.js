import { LightningElement } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

const BASE_URL = '/shared/libs/';
const LIB_JS = 'demo-library-1.0.js';
const LIB_CSS = 'demo-library-1.0.css';

export default class xDemoContainer extends LightningElement {
    connectedCallback() {
        Promise.all([
            loadStyle(this, BASE_URL + LIB_CSS),
            loadScript(this, BASE_URL + LIB_JS),
        ])
            .then(() => {
                const div = this.template.querySelector('div');

                DemoLibrary.init({
                    title: 'CSS IS AWESOME',
                }).addTo(div);
            })
            .catch(error => {
                console.log(error);
            });
    }
}

import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import TEST_LIB from '@salesforce/resourceUrl/testLib';
import { bar } from './util';

export default class TestComponent extends LightningElement {
    greeting = 'World';

    testLibInitialized = false;

    renderedCallback() {
        if (this.testLibInitialized) {
            return;
        }
        this.testLibInitialized = true;

        loadScript(this, TEST_LIB)
            .then(() => {
                foo();
                bar();
            })
            .catch(error => {
                this.error = error;
            });
    }
}

import { LightningElement } from 'lwc';
import { foo } from 'test/testLib';
import { bar } from './util';

export default class TestComponent extends LightningElement {
    greeting = 'World';

    constructor() {
        super();
        foo();
        bar();
    }
}

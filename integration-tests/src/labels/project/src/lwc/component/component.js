import { LightningElement } from 'lwc';
import testLabel from '@salesforce/label/c.testLabel';
import labelUnknown from '@salesforce/label/c.labelUnknown';

export default class Hello extends LightningElement {
    labels = {
        testLabel,
        labelUnknown
    };
}

import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api horizontalAlign;
    @api verticalAlign;
    @api pullToBoundary;
    @api multipleRows = false;

    @api layoutItems = [];
}

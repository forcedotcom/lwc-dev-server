import { LightningElement, api } from 'lwc';
import mix from 'lightning/mixinBuilder';
import { baseNavigation } from 'lightning/datatableKeyboardMixins';
import template from './datatableRowOrderingButtons.html';

export default class RowOrderingButtons extends mix(LightningElement).with(
    baseNavigation
) {
    @api rowId;
    @api isFirstRow;
    @api isLastRow;

    render() {
        return template;
    }
}

import { LightningElement, api, track } from 'lwc';
import mix from 'lightning/mixinBuilder';
import { baseNavigation } from 'lightning/datatableKeyboardMixins';
import template from './native-inputables.html';

export default class NativeInputables extends mix(LightningElement).with(baseNavigation) {
    @track
    isInputDisabled = false;

    @api
    disableInput() {
        this.isInputDisabled = true;
    }

    @api
    removeHref() {
        this.template.querySelector('a').removeAttribute('href');
    }

    @api
    setInputInvisible() {
        this.template.querySelector('input').style.visibility = 'hidden';
    }

    @api
    setInputDisplayNone() {
        this.template.querySelector('input').style.display = 'none';
    }

    render() {
        return template;
    }
}

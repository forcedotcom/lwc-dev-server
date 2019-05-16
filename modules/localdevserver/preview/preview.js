import { LightningElement, api, track } from 'lwc';
import { createElement } from 'talon/componentService';

export default class Preview extends LightningElement {
    @track _cmp;
    @api
    set cmp(c) {
        this._cmp = c;
        createElement(c).then(el => {
            const cont = this.template.querySelector('.container');
            cont.appendChild(el);
        });
    }
    get cmp() {
        return this._cmp;
    }

    get href() {
        return `/lwc/preview/${this._cmp}`;
    }
}

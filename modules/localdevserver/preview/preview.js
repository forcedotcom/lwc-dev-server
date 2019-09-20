import { LightningElement, api, track } from 'lwc';
import { createElement } from 'talon/componentService';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';

export default class Preview extends LightningElement {
    @track _cmp;
    @track error;
    @track cmpData;
    @track isLoading = true;

    get componentLabel() {
        return this.cmpData ? this.cmpData.htmlName : undefined;
    }

    get cmp() {
        return this._cmp;
    }
    @api
    set cmp(c) {
        this._cmp = c;

        getComponentMetadata(c).then(data => {
            this.cmpData = data;
        });

        createElement(c)
            .then(el => {
                const cont = this.template.querySelector('.container');
                cont.appendChild(el);
            })
            .catch(err => {
                this.error = err;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    get href() {
        return `/lwc/preview/${this._cmp}`;
    }

    get vscodeHref() {
        return this.cmpData && this.cmpData.path
            ? `vscode://file/${this.cmpData.path}`
            : 'javascript:void(0);';
    }
}

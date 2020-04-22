import { LightningElement, api, track } from 'lwc';
import { createElement } from 'webruntime/componentService';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';

export default class Preview extends LightningElement {
    @track _cmp;
    @track error;
    @track metadata;
    @track isLoading = true;

    get cmp() {
        return this._cmp;
    }

    @api
    set cmp(jsName) {
        this._cmp = jsName;

        getComponentMetadata(this._cmp).then(data => {
            this.metadata = data;
        });

        // TODO Edge breaks without the timeout, need to investigate further
        setTimeout(() => {
            createElement(jsName)
                .then(el => {
                    const container = this.template.querySelector('.container');
                    container.appendChild(el);
                    this.isLoading = false;
                })
                .catch(err => {
                    this.error = err;
                    this.isLoading = false;
                });
        }, 0);
    }

    get componentLabel() {
        return this.metadata ? this.metadata.htmlName : undefined;
    }

    get href() {
        return this.metadata ? this.metadata.url : 'javascript:void(0);';
    }

    get vscodeHref() {
        return this.metadata && this.metadata.path
            ? `vscode://file/${this.metadata.path}`
            : 'javascript:void(0);';
    }
}
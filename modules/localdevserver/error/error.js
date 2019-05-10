import { LightningElement, api, track } from 'lwc';
import { createElement } from 'talon/componentService';

export default class Error extends LightningElement {
    @track
    _error;

    @track
    code;

    @api
    set error(newError) {
        this._error = newError;
        if (this._error && this._error.cause.filename) {
            fetch(`/show?file=${this._error.cause.filename}`, {
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        return;
                    }
                    return response.text();
                })
                .then(text => {
                    if (text) {
                        this.code = text;
                    }
                });
        }
    }
    get error() {
        return this._error;
    }
    get errorMessage() {
        return this.error.message;
    }
    get errorLocation() {
        return `${this.error.cause.filename}:${
            this.error.cause.location.line
        }:${this.error.cause.location.column}`;
    }
}

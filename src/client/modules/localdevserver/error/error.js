import { LightningElement, api, track } from 'lwc';
import { getNonce } from '../projectMetadataLib/projectMetadataLib';

export default class Error extends LightningElement {
    @track
    _error;

    @track
    errorMessage;

    @track
    errorLocation;

    @track
    errorLine;

    @track
    code;

    @track
    lineOffset = 1;

    @track
    visible = true;

    get href() {
        if (this.errorLocation) {
            return 'vscode://file' + this.errorLocation;
        }
    }

    @api
    set error(newError) {
        this._error = newError;
        if (this.error && this.error.specifier) {
            fetch(
                `/localdev/${getNonce()}/errorDetails?specifier=${
                    this._error.specifier
                }`,
                {
                    credentials: 'same-origin'
                }
            )
                .then(response => {
                    if (!response.ok) {
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    const err = data.errors[0];
                    const locLine = err.location ? err.location.line : '0';
                    const locColumn = err.location ? err.location.column : '0';
                    this.errorLine = locLine;
                    this.errorLocation = `${err.filename}:${locLine}:${locColumn}`;
                    this.errorMessage = err.message;
                    this.code = err.code;
                });
        } else {
            this.errorMessage = this.error.message;
            this.errorLine = 0;
            this.errorLocation = null;
        }
    }
    get error() {
        return this._error;
    }

    handleClose() {
        this.visible = false;
    }
}

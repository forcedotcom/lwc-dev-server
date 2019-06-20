import { LightningElement, api, track } from 'lwc';
import { createElement } from 'talon/componentService';

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
        if (this.error && this.error.filename) {
            if (this.error.location) {
                this.errorLocation = `${this.error.filename}:${
                    this.error.location.line
                }:${this.error.location.column}`;
                this.errorLine = this.error.location.line;
            } else {
                this.errorLocation = `${this.error.filename}`;
                this.errorLine = null;
            }
            this.errorMessage = this.processMessage(this.error.message);
            fetch(`/show?file=${this._error.filename}`, {
                credentials: 'same-origin'
            })
                .then(response => {
                    debugger;
                    if (!response.ok) {
                        return;
                    }
                    return response.text();
                })
                .then(text => {
                    if (text) {
                        // source code can be thousands of lines. Just show context
                        // around where the error occured. 5 lines before, and 5 lines after.
                        if (this.errorLine) {
                            let lines = text.split('\n');
                            const start = Math.max(1, this.errorLine - 5);
                            const end = Math.min(
                                this.errorLine + 5,
                                lines.length
                            );
                            lines = lines.slice(start, end);
                            this.lineOffset = start + 1;
                            this.code = lines.join('\n');
                        } else {
                            this.code = text;
                        }
                    }
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
    processMessage(message) {
        let msg = message.split('\n')[0];
        if (msg.indexOf(this.error.filename >= 0)) {
            msg = msg.replace(this.error.filename + ':', '');
            msg = msg.replace(this.error.filename, '');
        }
        return msg;
    }

    handleClose() {
        this.visible = false;
    }
}

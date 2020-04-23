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
        console.log('waaaaa el error');
        console.log('error ==> ', this.error);
        if (this.error && this.error.filename) {
            if (this.error.location) {
                this.errorLocation = `${this.error.filename}:${this.error.location.line}:${this.error.location.column}`;
                this.errorLine = this.error.location.line;
            } else {
                this.errorLocation = `${this.error.filename}`;
                this.errorLine = null;
            }
            this.errorMessage = this.processMessage(this.error.message);
            console.log('error, before running fetch localdev/.../');
            fetch(`/localdev/${getNonce()}/show?file=${this._error.filename}`, {
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        return;
                    }
                    console.log('fetch error response ===> ');
                    console.log(response);
                    return response.json();
                    // return response.text();
                })
                .then(data => {
                    console.log(data);
                    console.log('data location ==> ');
                    console.log(data.location);
                    console.log(data.code);
                    this.errorLine = data.location.line;
                    this.errorLocation = `${data.filename}:${data.location.line}:${data.location.column}`;
                    this.errorMessage =
                        'SyntaxError: /Users/lcamposguajardo/github/DevTools/lwc-recipes/force-app/main/default/lwc/clock/clock.js: LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"\n';
                    this.code = '\u001b[0m \u001b[90m 2 | \u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 | \u001b[39m\u001b[36mexport\u001b[39m \u001b[36mdefault\u001b[39m \u001b[36mclass\u001b[39m \u001b[33mClock\u001b[39m \u001b[36mextends\u001b[39m \u001b[33mLightningElement\u001b[39m {\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 4 | \u001b[39m    \u001b[33m@\u001b[39mtrack timestamp \u001b[33m=\u001b[39m \u001b[36mnew\u001b[39m \u001b[33mDate\u001b[39m()\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   | \u001b[39m    \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 5 | \u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 6 | \u001b[39m    \u001b[33m@\u001b[39mapi\u001b[0m\n\u001b[0m \u001b[90m 7 | \u001b[39m    refresh() {\u001b[0m'.replace(
                        /\u001b\[.*?m/g,
                        ''
                    );
                });
            /* .then(text => {
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
                }); */
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

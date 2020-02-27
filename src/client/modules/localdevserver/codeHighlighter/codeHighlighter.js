import { LightningElement, api, track } from 'lwc';
import Prismjs from './prismjs';

export default class CodeHighlighter extends LightningElement {
    @api
    line;

    @track
    _lineOffset = 1;

    @track _code;
    @api set code(newCode) {
        this._code = newCode;
        this.doHighlight();
    }
    get code() {
        return this._code;
    }
    @api set lineOffset(newLineOffset) {
        this._lineOffset = newLineOffset;
        this.doHighlight();
    }
    get lineOffset() {
        return this._lineOffset;
    }
    doHighlight() {
        const div = this.template.querySelector('div');
        if (div && this.code) {
            while (div.hasChildNodes()) {
                div.removeChild(div.lastChild);
            }
            const pre = document.createElement('pre');
            pre.setAttribute('class', 'line-numbers');
            pre.setAttribute('data-line', this.line);
            pre.setAttribute('data-start', this.lineOffset);
            const codeEL = document.createElement('code');
            pre.appendChild(codeEL);
            codeEL.setAttribute('class', 'language-javascript');
            codeEL.innerHTML = this.code;

            div.appendChild(pre);

            // the reason we have this timeout is because the changes
            // need to go through a rehydration cycle before they are
            // fully on the real DOM. The highlighter expects to run on
            // fully rendered DOM nodes. (I think!)
            setTimeout(() => {
                this.highlight();
            }, 0);
        }
    }
    get lineOffset() {
        return this._lineOffset;
    }

    @api
    highlight() {
        Prismjs.highlightAllUnder(this.template, false);
    }

    connectedCallback() {
        const namespace = 'localdevserver';
        const modulename = 'codehighlighter';
        const scopeAttribute = `${namespace}-${modulename}_${modulename}`;
        Prismjs.createElementFn = element => {
            element.setAttribute(scopeAttribute, '');
            const elems = element.querySelectorAll('*');
            for (const el of elems) {
                el.setAttribute(scopeAttribute, '');
            }
        };
    }
}

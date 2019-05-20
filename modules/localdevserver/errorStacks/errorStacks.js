import { LightningElement, api, track } from 'lwc';

export default class ErrorStacks extends LightningElement {
    @track collapsed = true;

    @api
    error;

    get collapseMessage() {
        if (this.collapsed) {
            return `${this.count} stack frames collapsed`;
        } else {
            return 'Collapse stack frames';
        }
    }
    get count() {
        if (this.error) {
            if (Array.isArray(this.error.stack)) {
                return this.error.stack.length;
            } else if (this.error.stack) {
                const split = this.error.stack.split('\n');
                return split.length;
            }
        }
        return 0;
    }
    get stack() {
        if (this.error) {
            if (Array.isArray(this.error.stack)) {
                return this.error.stack;
            } else {
                if (this.error.filename) {
                    let [first, ...rest] = this.error.stack.split('\n');
                    rest = rest.filter(s => /^\s*at.*/.test(s));
                    return [first, ...rest].join('\n');
                }
                return this.error.stack;
            }
        }
    }
    handleOnClick() {
        this.collapsed = !this.collapsed;
    }
}

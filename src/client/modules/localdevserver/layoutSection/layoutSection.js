import { LightningElement, api } from 'lwc';

/**
 * Used to enforce a consistent max-width and auto margins for
 * top-level layout sections.
 */
export default class LayoutSection extends LightningElement {
    /**
     * Specify true if this is the main content section.
     *
     * @type {boolean}
     */
    @api mainContent;

    connectedCallback() {
        if (this.mainContent) {
            this.classList.add('main-content');
        }
    }
}

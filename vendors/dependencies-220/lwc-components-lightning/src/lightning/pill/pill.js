import labelPillDelete from '@salesforce/label/LightningPill.delete';
import labelPillError from '@salesforce/label/LightningPill.error';
import labelPillRemove from '@salesforce/label/LightningPill.remove';
import labelPillWarning from '@salesforce/label/LightningPill.warning';
import labelPillDeleteAndNavigate from '@salesforce/label/LightningPill.deleteAndNavigate';
import { LightningElement, api, track } from 'lwc';
import {
    keyCodes,
    classListMutation,
    normalizeBoolean,
    isAbsoluteUrl,
} from 'lightning/utilsPrivate';
import link from './link.html';
import plain from './plain.html';
import plainLink from './plainLink.html';
import { updateRawLinkInfo } from 'lightning/routingService';

const i18n = {
    pillDelete: labelPillDelete,
    pillError: labelPillError,
    pillRemove: labelPillRemove,
    pillWarning: labelPillWarning,
    pillDeleteAndNavigate: labelPillDeleteAndNavigate,
};

const VARIANT = {
    PLAIN: 'plain',
    PLAIN_LINK: 'plainLink',
    LINK: 'link',
};

function modifyAttribute(el, name, value) {
    if (!el.isPlainLink) {
        if (value !== null && value !== undefined && value !== '') {
            el.setAttribute(name, value);
        } else {
            el.removeAttribute(name);
        }
    } else {
        el.removeAttribute(name);
    }
}
/**
 * A pill displays a label that can contain links and can be removed from view.
 * @slot default Placeholder for an image, such as an icon or avatar.
 */
export default class LightningPill extends LightningElement {
    /**
     * The URL of the page that the link goes to.
     * @type {string}
     */
    @api
    get href() {
        return this._href;
    }
    set href(value) {
        this._href = value;
        if (this._connected && (this.isPlainLink || this.isLink)) {
            this.updateLinkInfo(value);
        }
    }
    @track _href;

    /**
     * The text label that displays in the pill.
     * @type {string}
     * @required
     */
    @api label;

    /**
     * The name for the pill. This value is optional and can be used to identify the pill in a callback.
     * @type {string}
     */
    @api name;

    /**
     * The variant changes the appearance of the pill.
     * Accepted variants include link, plain, and plainLink.
     * The default variant is link, which creates a link in the pill when you specify the href attribute.
     * The plain variant renders the pill without a link and ignores the href attribute.
     * The plainLink variant is reserved for internal use.
     * @type {string}
     * @default link
     */
    @api variant = VARIANT.LINK;

    @track _role;
    @track _ariaSelected;
    @track _hasMedia = true;
    @track _hasError;
    @track _tabIndex;

    _connected = false;
    _dispatcher = () => {};

    render() {
        switch (this.variant) {
            case VARIANT.PLAIN:
                return plain;
            case VARIANT.PLAIN_LINK:
                return plainLink;
            case VARIANT.LINK:
            default:
                return link;
        }
    }

    /**
     * If present, the pill is shown with a red border and an error icon on the left of the label.
     * @type {boolean}
     * @default false
     */
    @api
    get hasError() {
        return this._hasError || false;
    }
    set hasError(value) {
        this._hasError = normalizeBoolean(value);
    }

    get assistiveText() {
        return this.variant === VARIANT.PLAIN_LINK
            ? this.i18n.pillDeleteAndNavigate
            : this.i18n.pillDelete;
    }

    constructor() {
        super();
        this.addEventListener('keydown', this.handleKeypress.bind(this));
    }

    get pillClass() {
        const cssClass = ['slds-pill'];
        switch (this.variant) {
            case VARIANT.PLAIN:
            case VARIANT.PLAIN_LINK:
                break;
            case VARIANT.LINK:
            default:
                cssClass.push('slds-pill_link');
        }
        return cssClass;
    }

    checkMediaElement() {
        if (!this._mediaElement) {
            this._mediaElement = this.template.querySelector('slot');
        }
        return (
            this._mediaElement && this._mediaElement.assignedNodes().length > 0
        );
    }
    renderedCallback() {
        const el = this.isPlainLink ? this.template.querySelector('a') : this;
        this.pillClass.forEach(name => el.classList.add(name));

        // check if a component was passed into the slot
        this._hasMedia = this.checkMediaElement();

        classListMutation(this.classList, {
            'slds-has-error': this.hasError,
        });

        // set attributes to self if variant is plain or link
        modifyAttribute(this, 'tabindex', this.tabIndex);
        modifyAttribute(this, 'role', this.role);
        modifyAttribute(this, 'aria-selected', this.ariaSelected);
    }

    /**
     * Reserved for internal use. Specifies whether the element variant is a plain link.
     * @type {boolean}
     * @return {boolean} true if variant is a plain link.
     */
    @api
    get isPlainLink() {
        return this.variant === VARIANT.PLAIN_LINK;
    }

    get isLink() {
        return this.variant === VARIANT.LINK;
    }

    /**
     * Reserved for internal use. Use tabindex instead to indicate if an element should be focusable.
     * A value of 0 means that the pill is focusable and
     * participates in sequential keyboard navigation. A value of -1 means
     * that the pill is focusable but does not participate in keyboard navigation.
     * @type {number}
     */
    @api
    get tabIndex() {
        return this._tabIndex;
    }
    set tabIndex(value) {
        this._tabIndex = value;
        modifyAttribute(this, 'tabindex', this._tabIndex);
    }

    /**
     * Specifies the aria-selected of an element.
     */
    @api
    get ariaSelected() {
        return this._ariaSelected;
    }
    set ariaSelected(value) {
        this._ariaSelected = normalizeBoolean(value);
        modifyAttribute(this, 'aria-selected', this._ariaSelected);
    }

    /**
     * Specifies the role of an element.
     */
    @api
    get role() {
        return this._role;
    }
    set role(value) {
        this._role = value;
        modifyAttribute(this, 'role', this._role);
    }

    get i18n() {
        return i18n;
    }

    get hasHref() {
        return !!this.href;
    }

    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = this.template.querySelector(
                'a.slds-pill__label'
            );
        }
        return this._labelElement;
    }

    get removeIconElement() {
        if (!this._removeIconElement) {
            this._removeIconElement = this.template.querySelector(
                'lightning-primitive-icon'
            );
        }
        return this._removeIconElement;
    }

    connectedCallback() {
        this._connected = true;
        if (this.isPlainLink || this.isLink) {
            this.updateLinkInfo(this.href);
        }
    }

    disconnectedCallback() {
        this._connected = false;
    }

    handleKeypress(event) {
        switch (event.keyCode) {
            case keyCodes.delete:
            case keyCodes.backspace:
                this.handleRemove(event);
                break;
            case keyCodes.enter:
                this.handleEnter(event);
                break;
            default:
        }
    }

    handleEnter() {
        if (this.isPlainLink) {
            if (this.labelElement) {
                this.labelElement.click();
            }
        }
    }

    handleClick(event) {
        if (event.target === this.removeIconElement) {
            // click on the X icon to remove the item
            event.stopPropagation();
            event.preventDefault();
            this.handleRemove(event);
        } else if (this.isPlainLink || this.isLink) {
            this._dispatcher(event);
        }
    }

    handleRemove(event) {
        const removeEvent = new CustomEvent('remove', {
            cancelable: true,
            detail: {
                name: this.name,
            },
        });

        this.dispatchEvent(removeEvent);

        if (removeEvent.defaultPrevented) {
            event.stopPropagation();
        }
    }

    /**
     * Reserved for internal use.
     * Sets focus on the anchor element for a plain link.
     */
    @api
    focusLink() {
        const el = this.template.querySelector('A');
        if (el) {
            el.focus();
        }
    }

    updateLinkInfo(url) {
        updateRawLinkInfo(this, { url: this.makeAbsoluteUrl(url) }).then(
            linkInfo => {
                this._url = linkInfo.url;
                this._dispatcher = linkInfo.dispatcher;
            }
        );
    }

    makeAbsoluteUrl(url) {
        return isAbsoluteUrl(url) ? url : `http://${url}`;
    }
}

import * as CONSTANTS from './constants';
import { api, LightningElement } from 'lwc';
import { getFormFactor } from 'lightning/configProvider';
import { normalizeVariant, VARIANT } from 'lightning/inputUtils';
import { classListMutation } from 'lightning/utilsPrivate';

export default class LightningLookup extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Checks the lookup validity, and fires an 'invalid' event if it's in invalid state.
     * @return {Boolean} - The validity status of the lookup.
     */
    @api
    checkValidity() {
        if (this._lookupElement) {
            return this._lookupElement.checkValidity();
        }

        return false;
    }

    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * The lookup name api field.
     * @type {String}
     */
    @api fieldName;

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }

        if (this._lookupElement) {
            this._lookupElement.focus();
        }
    }

    /**
     * The text label for the layout field.
     * @type {String}
     */
    @api label;

    /**
     * The maximum number of records that can be inserted in the lookup.
     * @type {Number}
     */
    @api maxValues = 1;

    /**
     * @return {String} The error message to be displayed when the user enters the text in
     * the input but does not select a valid option.
     */
    @api
    get messageWhenBadInput() {
        if (this._lookupElement) {
            this._messageWhenBadInput = this._lookupElement.messageWhenBadInput;
        }

        return this._messageWhenBadInput;
    }

    /**
     * Sets the error message to be displayed when the user enters the text in the input
     * but does not select a valid option.
     * @param {String} value - The error message.
     */
    set messageWhenBadInput(value) {
        this._messageWhenBadInput = value;

        if (this._lookupElement) {
            this._lookupElement.messageWhenBadInput = this._messageWhenBadInput;
        }
    }

    /**
     * @return {String} The error message to be displayed when the lookup value
     * is required but is currently missing.
     */
    @api
    get messageWhenValueMissing() {
        if (this._lookupElement) {
            this._messageWhenValueMissing = this._lookupElement.messageWhenValueMissing;
        }

        return this._messageWhenValueMissing;
    }

    /**
     * The error message to be displayed when the lookup value is required but is currently missing.
     * @param {String} value - The error message.
     */
    set messageWhenValueMissing(value) {
        this._messageWhenValueMissing = value;

        if (this._lookupElement) {
            this._lookupElement.messageWhenValueMissing = this._messageWhenValueMissing;
        }
    }

    /**
     * The source record's objectInfos.
     * @param {Object}
     */
    @api objectInfos;

    /**
     * The source record representation.
     * @type {Object}
     */
    @api record;

    /**
     * Indicates whether or not the field is required.
     * The field info in the object info is not updated based on the layout metadata.
     * It allows field to be marked as required for the given layout.
     * @type {Boolean}
     */
    @api required = false;

    /**
     * Shows validation message based on the validity status.
     * @return {Boolean} - The validity status of the lookup.
     */
    @api
    reportValidity() {
        if (this._lookupElement) {
            return this._lookupElement.reportValidity();
        }

        return false;
    }

    /**
     * Sets a custom validity message.
     * @param {String} message - The validation message to be shown in an error state.
     */
    @api
    setCustomValidity(message) {
        if (this._lookupElement) {
            this._lookupElement.setCustomValidity(message);
        }
    }

    /**
     * Indicates whether or not the show create new option.
     * TODO - Remove when @wire(getLookupActions) response is invocable.
     * @type {Boolean}
     */
    @api showCreateNew = false;

    /**
     * Displays a validation message if the lookup is in invalid state.
     */
    @api
    showHelpMessageIfInvalid() {
        if (this._lookupElement) {
            this._lookupElement.showHelpMessageIfInvalid();
        }
    }

    /**
     * Gets the validity constraint of the lookup.
     * @return {Object} - The current validity constraint.
     */
    @api
    get validity() {
        if (this._lookupElement) {
            return this._lookupElement.validity;
        }

        return null;
    }

    /**
     * @return {Array} An array of selected lookup values.
     */
    @api
    get value() {
        if (this._lookupElement) {
            this._value = this._lookupElement.value;
        }

        return this._value;
    }

    /**
     * Sets the values for the lookup.
     * @param {Array} value - An array of record ids.
     */
    set value(value) {
        this._value = value;

        if (this._lookupElement) {
            this._lookupElement.value = value;
        }
    }

    /**
     * @return {String} The value of variant.
     */
    @api
    get variant() {
        if (this._lookupElement) {
            this._variant = this._lookupElement.variant;
        }

        return this._variant || VARIANT.STANDARD;
    }

    /**
     * Sets the variant type for the lookup.
     * @param {String} value - The value of variant.
     */
    set variant(value) {
        this._variant = normalizeVariant(value);

        if (this._lookupElement) {
            this._lookupElement.variant = this._variant;
        }
        this.updateClassList();
    }

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================
    /**
     * Indicates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    /**
     * Indicates whether or not the component is loaded on the desktop form factor.
     * @type {Boolean}
     */
    _isDesktop;

    /**
     * Indicates whether or not the inititial props are set on the child lookup element.
     * @type {Boolean}
     */
    _initProps = false;

    /**
     * The lookup DOM element.
     * @type {Object}
     */
    _lookupElement;

    /**
     * The error message to be displayed when the user enters the text in the input but does
     * not select a valid option.
     * @type {String}
     */
    _messageWhenBadInput;

    /**
     * The error message to be displayed when the lookup value is required but is currently missing.
     * @type {String}
     */
    _messageWhenValueMissing;

    /**
     * An array of selected values for the lookup.
     * @type {Array}
     */
    _value;

    /**
     * Variant type of the lookup.
     * @type {String}
     */
    _variant;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================
    /**
     * Indicates whether or not the component is loaded on the desktop form factor.
     * @return {Boolean} - See desc.
     */
    get isDesktop() {
        return this._isDesktop;
    }

    /**
     * Returns the lookup DOM element.
     * @returns {Object} - See desc.
     */
    get lookupElement() {
        if (!this._connected) {
            return null;
        }

        if (this._lookupElement) {
            return this._lookupElement;
        }

        return null;
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        const formFactor = getFormFactor();
        this._isDesktop = formFactor === CONSTANTS.FORM_FACTOR_DESKTOP;
    }

    connectedCallback() {
        this._connected = true;
        this.classList.add('slds-form-element');
        this.updateClassList();
    }

    updateClassList() {
        classListMutation(this.classList, {
            'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
            'slds-form-element_horizontal':
                this.variant === VARIANT.LABEL_INLINE,
        });
    }

    disconnectedCallback() {
        this._connected = false;
        this._initProps = false;
        this._lookupElement = undefined;
    }

    renderedCallback() {
        if (!this._lookupElement) {
            const lookupSelector = this._isDesktop
                ? CONSTANTS.LIGHTNING_LOOKUP_DESKTOP
                : CONSTANTS.LIGHTNING_LOOKUP_MOBILE;
            this._lookupElement = this.template.querySelector(lookupSelector);
        }

        if (!this._initProps) {
            this.synchronizeProps();
            this._initProps = true;
        }
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    /**
     * Synchronizes properties with child lookup element.
     */
    synchronizeProps() {
        if (this._lookupElement) {
            this._lookupElement.value = this._value;
            this._lookupElement.variant = this._variant;
            if (this._messageWhenBadInput !== undefined) {
                this._lookupElement.messageWhenBadInput = this._messageWhenBadInput;
            }
            if (this._messageWhenValueMissing !== undefined) {
                this._lookupElement.messageWhenValueMissing = this._messageWhenValueMissing;
            }
        }
    }
}

import * as CONSTANTS from './constants';
import { api, LightningElement, track } from 'lwc';
import { FieldConstraintApi } from 'lightning/inputUtils';
import { getFieldProperties } from './utils';

export default class LightningLookupMobile extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Checks the lookup validity, and fires an 'invalid' event if it's in invalid state.
     * @return {Boolean} - The validity status of the lookup.
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * @return {String} The lookup field API name.
     */
    @api
    get fieldName() {
        return this._fieldName;
    }

    /**
     * Sets the api name for the lookup field.
     * @param {String} value - The lookup field api name.
     */
    set fieldName(value) {
        this._fieldName = value;
        const { fieldLevelHelp, isRequired } = getFieldProperties(
            this._record,
            this._fieldName,
            this._objectInfos
        );
        this.fieldLevelHelp = fieldLevelHelp;
        this.isRequired = isRequired;
    }

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }

        const input = this.template.querySelector(CONSTANTS.LIGHTNING_INPUT);

        if (input) {
            input.focus();
        }
    }

    /**
     * The text label for the layout field.
     * @type {String}
     */
    @api label;

    /**
     * @return {Number} - The maximum number of values supported by the lookup.
     */
    @api
    get maxValues() {
        return this._maxValues;
    }

    /**
     * Sets the maximum number of values that can be inserted into the lookup.
     * @param {Number} value - The maximum number of values for the lookup.
     */
    set maxValues(value) {
        this._maxValues = value;
        const values = Object.assign([], this._value);
        this.updateValue(values);
    }

    /**
     * The error message to be displayed when the user enters bad input.
     * @type {String}
     */
    @api messageWhenBadInput;

    /**
     * The error message to be displayed when the lookup value is required but is
     * currently missing.
     * @type {String}
     */
    @api messageWhenValueMissing;

    /**
     * @return {Object} The source record's objectInfos.
     */
    @api
    get objectInfos() {
        return this._objectInfos;
    }

    /**
     * Sets the source record's objectInfos.
     * @param {Object} value - The source record's objectInfos.
     */
    set objectInfos(value) {
        this._objectInfos = value;
        const { fieldLevelHelp, isRequired } = getFieldProperties(
            this._record,
            this._fieldName,
            this._objectInfos
        );
        this.fieldLevelHelp = fieldLevelHelp;
        this.isRequired = isRequired;
    }

    /**
     * @return {Object} Returns the source record representation.
     */
    @api
    get record() {
        return this._record;
    }

    /**
     * Sets the source record representation.
     * @param {Object} value - The source record.
     */
    set record(value) {
        this._record = value;
        const { fieldLevelHelp, isRequired } = getFieldProperties(
            this._record,
            this._fieldName,
            this._objectInfos
        );
        this.fieldLevelHelp = fieldLevelHelp;
        this.isRequired = isRequired;
    }

    /**
     * Shows validation message based on the validity status.
     * @return {Boolean} - The validity status of the lookup.
     */
    @api
    reportValidity() {
        const input = this.template.querySelector(CONSTANTS.LIGHTNING_INPUT);

        if (input) {
            return this._constraint.reportValidity(message => {
                input.setCustomValidity(message);
                input.reportValidity();
            });
        }

        return null;
    }

    /**
     * Sets a custom validity message.
     * @param {String} message - The validation message to be shown in an error state.
     */
    @api
    setCustomValidity(message) {
        const input = this.template.querySelector(CONSTANTS.LIGHTNING_INPUT);

        if (input) {
            this._constraint.setCustomValidity(message);
            input.setCustomValidity(message);
        }
    }

    /**
     * Indicates whether or not the field is required.
     * // TODO - Consume required api.
     * @type {Boolean}
     */
    @api required = false;

    /**
     * Indicates whether or not to show the create new option.
     * // TODO - Consume showCreateNew api.
     * @type {Boolean}
     */
    @api showCreateNew = false;

    /**
     * Displays an error message if the combobox value is required but missing.
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Gets the validity constraint of the lookup.
     * @return {Object} - The current validity constraint.
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * @return {Array} An array of selected lookup values.
     */
    @api
    get value() {
        return this._value;
    }

    /**
     * Sets the values for the lookup.
     * @param {Array} value - An array of record ids.
     */
    set value(value) {
        this.updateValue(value);
    }

    /**
     * Sets the variant type for the lookup.
     * @type {String}
     */
    @api variant;

    // ================================================================================
    // REACTIVE PROPERTIES
    // ================================================================================
    /**
     * The field level help text.
     * @type {String}
     */
    @track fieldLevelHelp;

    /**
     * The value for the input element.
     * @type {String}
     */
    @track inputValue;

    /**
     * Indicates if the field is required.
     * @type {Boolean}
     */
    @track isRequired;

    /**
     * The max size (in characters) for the input.
     * @type {Number}
     */
    @track maxlength;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================
    /**
     * Indiciates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    /**
     * The api name for the lookup field.
     * @type {String}
     */
    _fieldName;

    /**
     * The maximum number of values supported by the lookup.
     * @type {Number}
     */
    _maxValues;

    /**
     * The source record's objectInfos.
     * @type {Object}
     */
    _objectInfos;

    /**
     * The source record representation.
     * @type {Object}
     */
    _record;

    /**
     * An array of values of the selected lookup.
     * @type {Array}
     */
    _value;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================
    /**
     * Gets the validity constaint.
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    this.isRequired &&
                    (!Array.isArray(this._value) || !this._value.length),
            });
        }
        return this._constraintApi;
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        this.maxlength = CONSTANTS.INPUT_MAX_LENGTH;
    }

    connectedCallback() {
        this._connected = true;
    }

    disconnectedCallback() {
        this._connected = false;
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    /**
     * Fires an event with details for parent component to handle.
     * @param {String} type - The type of event being dispatched.
     * @param {Object} detail - The event data.
     * @param {Boolean} bubbles - Whether or not the event bubbles.
     */
    fireEvent(type, detail, bubbles) {
        this.dispatchEvent(
            // eslint-disable-next-line lightning-global/no-custom-event-identifier-arguments
            new CustomEvent(type, {
                composed: bubbles,
                bubbles,
                detail,
            })
        );
    }

    handleInputValueChange(event) {
        // Stop input event propagation.
        event.stopPropagation();

        // No-op if event detail is empty.
        if (!event.detail) {
            return;
        }

        const text = (event.detail.value || '').trim();
        let values;

        if (!text.length) {
            // Default empty string value to an empty array.
            values = [];
        } else {
            // Convert comma separated values to an array.
            values = text.split(',');
        }

        this.updateValue(values);
    }

    /**
     * Updates the live value and sets the pills.
     * @param {Array} value - An array of record ids.
     */
    updateValue(value) {
        if (value === undefined) {
            this._value = value;
            return;
        } else if (value === null) {
            value = [];
        }

        if (!Array.isArray(value)) {
            return;
        }

        // Drop empty values, and trim them to remove extra white spaces.
        value = value.filter(val => val).map(val => val.trim());

        // Trim values to the max value count.
        if (value.length > this._maxValues) {
            value = value.slice(0, this._maxValues);
        }

        this._value = value;
        this.inputValue = value.join(',');

        // Fire event to notify that values have been changed.
        this.fireEvent(
            CONSTANTS.EVENT_CHANGE,
            {
                value: this._value,
            },
            true
        );
    }
}

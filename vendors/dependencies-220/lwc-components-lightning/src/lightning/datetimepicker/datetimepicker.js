import labelDate from '@salesforce/label/LightningDateTimePicker.dateLabel';
import labelRangeOverflow from '@salesforce/label/LightningDateTimePicker.rangeOverflow';
import labelRangeUnderflow from '@salesforce/label/LightningDateTimePicker.rangeUnderflow';
import labelRequired from '@salesforce/label/LightningControl.required';
import labelTime from '@salesforce/label/LightningDateTimePicker.timeLabel';
import { LightningElement, track, api } from 'lwc';
import { classSet } from 'lightning/utils';
import {
    normalizeBoolean,
    normalizeAriaAttribute,
    synchronizeAttrs,
    getRealDOMId,
} from 'lightning/utilsPrivate';
import {
    getCurrentTime,
    normalizeISODateTime,
    normalizeFormattedDateTime,
} from 'lightning/internationalizationLibrary';
import { TIME_SEPARATOR } from 'lightning/iso8601Utils';
import {
    generateUniqueId,
    InteractingState,
    normalizeVariant,
    VARIANT,
} from 'lightning/inputUtils';

const i18n = {
    date: labelDate,
    rangeOverflow: labelRangeOverflow,
    rangeUnderflow: labelRangeUnderflow,
    required: labelRequired,
    time: labelTime,
};

export default class LightningDateTimePicker extends LightningElement {
    static delegatesFocus = true;

    @track _disabled = false;
    @track _readonly = false;
    @track _required = false;
    @track _fieldLevelHelp;
    @track _variant;
    @track _value = null;
    @track _dateValue = null;
    @track _timeValue = null;
    @track _customErrorMessage = '';
    @track _dateMin;
    @track _dateMax;

    @api label;
    @api name;
    @api timezone;
    @api placeholder = '';
    @api dateStyle;
    @api timeStyle;

    @api timeAriaLabel;
    @api autocomplete;

    // getters and setters necessary to trigger sync
    set timeAriaControls(val) {
        this._timeAriaControls = val;
        this.synchronizeA11y();
    }

    @api
    get timeAriaControls() {
        return this._timeAriaControls;
    }

    set timeAriaLabelledBy(val) {
        this._timeAriaLabelledBy = val;
        this.synchronizeA11y();
    }

    @api
    get timeAriaLabelledBy() {
        return this._timeAriaLabelledBy;
    }

    set timeAriaDescribedBy(val) {
        this._timeAriaDescribedBy = val;
        this.synchronizeA11y();
    }

    @api
    get timeAriaDescribedBy() {
        return this._timeAriaDescribedBy;
    }

    @api dateAriaControls;
    @api dateAriaLabel;
    @api dateAriaLabelledBy;
    @api dateAriaDescribedBy;

    @api messageWhenValueMissing;

    @api
    get messageWhenBadInput() {
        if (this._messageWhenBadInput) {
            return this._messageWhenBadInput;
        } else if (this.hasBadDateInput) {
            return this.getDatepicker().messageWhenBadInput;
        } else if (this.hasBadTimeInput) {
            return this.getTimepicker().messageWhenBadInput;
        }
        return null;
    }
    set messageWhenBadInput(message) {
        this._messageWhenBadInput = message;
    }

    @api
    get messageWhenRangeOverflow() {
        return (
            this._messageWhenRangeOverflow ||
            this.formatString(i18n.rangeOverflow, this.formattedMax)
        );
    }
    set messageWhenRangeOverflow(message) {
        this._messageWhenRangeOverflow = message;
    }

    @api
    get messageWhenRangeUnderflow() {
        return (
            this._messageWhenRangeUnderflow ||
            this.formatString(i18n.rangeUnderflow, this.formattedMin)
        );
    }
    set messageWhenRangeUnderflow(message) {
        this._messageWhenRangeUnderflow = message;
    }

    @api
    get max() {
        return this.maxValue;
    }
    set max(newValue) {
        this.maxValue = newValue;
        this.calculateFormattedMaxValue();
    }

    @api
    get min() {
        return this.minValue;
    }
    set min(newValue) {
        this.minValue = newValue;
        this.calculateFormattedMinValue();
    }

    @api
    get value() {
        return this._value;
    }
    set value(newValue) {
        const normalizedValue = this.normalizeInputValue(newValue);
        if (normalizedValue !== this._value) {
            if (!this.connected) {
                // we set the values in connectedCallback to make sure timezone is available.
                this._initialValue = normalizedValue;
                return;
            }
            this.setDateAndTimeValues(normalizedValue);
        }
    }

    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get readOnly() {
        return this._readonly;
    }
    set readOnly(value) {
        this._readonly = normalizeBoolean(value);
    }

    @api
    get required() {
        return this._required;
    }
    set required(value) {
        this._required = normalizeBoolean(value);
    }

    set fieldLevelHelp(value) {
        this._fieldLevelHelp = value;
    }

    @api
    get fieldLevelHelp() {
        return this._fieldLevelHelp;
    }

    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(value) {
        this._variant = normalizeVariant(value);
    }

    /**
     * Sets focus on the date input element.
     */
    @api
    focus() {
        if (this.connected) {
            this.getDatepicker().focus();
        }
    }

    /**
     * Removes keyboard focus from the input elements.
     */
    @api
    blur() {
        if (this.connected) {
            this.getDatepicker().blur();
            this.getTimepicker().blur();
        }
    }

    @api
    hasBadInput() {
        return this.connected && (this.hasBadDateInput || this.hasBadTimeInput);
    }

    get hasBadDateInput() {
        return this.getDatepicker().hasBadInput();
    }

    get hasBadTimeInput() {
        const timeBadInput = this.getTimepicker().hasBadInput();
        const timeMissing =
            this.required && this._dateValue && !this._timeValue;
        return timeMissing || timeBadInput;
    }

    @api
    showHelpMessage(message) {
        if (!this.connected) {
            return;
        }

        if (!message) {
            this.clearHelpMessage();
            return;
        }

        if (this.hasBadDateInput && !this._messageWhenBadInput) {
            this.clearHelpMessage();
            this.getDatepicker().showHelpMessage(message);
            return;
        }

        if (this.hasBadTimeInput && !this._messageWhenBadInput) {
            this.clearHelpMessage();
            this.getTimepicker().showHelpMessage(message);
            return;
        }

        this.classList.add('slds-has-error');
        this._customErrorMessage = message;
    }

    clearHelpMessage() {
        this.classList.remove('slds-has-error');
        this._customErrorMessage = '';
        this.getDatepicker().showHelpMessage('');
        this.getTimepicker().showHelpMessage('');
    }

    get isLabelHidden() {
        return this.variant === VARIANT.LABEL_HIDDEN;
    }

    get computedLabelClass() {
        return classSet('slds-form-element__legend slds-form-element__label')
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    get i18n() {
        return i18n;
    }

    get dateValue() {
        return this._dateValue;
    }

    get timeValue() {
        return this._timeValue;
    }

    get customErrorMessage() {
        return this._customErrorMessage;
    }

    get dateMin() {
        return this._dateMin;
    }

    get dateMax() {
        return this._dateMax;
    }

    get errorMessageElementId() {
        return getRealDOMId(this.template.querySelector('[data-error-message'));
    }

    get computedDateAriaDescribedBy() {
        const ariaValues = [];

        if (this.customErrorMessage) {
            ariaValues.push(this.errorMessageElementId);
        }
        if (this.dateAriaDescribedBy) {
            ariaValues.push(this.dateAriaDescribedBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    get computedTimeAriaDescribedBy() {
        const ariaValues = [];

        if (this.customErrorMessage) {
            ariaValues.push(this.errorMessageElementId);
        }
        if (this.timeAriaDescribedBy) {
            ariaValues.push(this.timeAriaDescribedBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    constructor() {
        super();

        this.uniqueId = generateUniqueId();
    }

    synchronizeA11y() {
        const datepicker = this.template.querySelector('lightning-datepicker');
        const timepicker = this.template.querySelector('lightning-timepicker');
        if (datepicker) {
            synchronizeAttrs(datepicker, {
                ariaLabelledByElement: this.dateAriaLabelledBy,
                ariaDescribedByElements: this.computedDateAriaDescribedBy,
                ariaControlsElement: this.dateAriaControls,
                'aria-label': this.dateAriaLabel,
            });
        }

        if (timepicker) {
            synchronizeAttrs(timepicker, {
                ariaLabelledByElement: this.timeAriaLabelledBy,
                ariaDescribedByElements: this.computedTimeAriaDescribedBy,
                ariaControlsElement: this.timeAriaControls,
                'aria-label': this.timeAriaLabel,
            });
        }
    }

    connectedCallback() {
        this.classList.add('slds-form_compound');
        this.calculateFormattedMinValue();
        this.calculateFormattedMaxValue();

        this.connected = true;

        // we set the initial values here in order to make sure timezone is available.
        this.setDateAndTimeValues(this._initialValue);

        this.interactingState = new InteractingState();

        this.interactingState.onenter(() => {
            this.dispatchEvent(new CustomEvent('focus'));
        });

        this.interactingState.onleave(() => {
            this.dispatchEvent(new CustomEvent('blur'));
        });
    }

    renderedCallback() {
        this.synchronizeA11y();
    }

    disconnectedCallback() {
        this.connected = false;
    }

    getTimepicker() {
        return this.template.querySelector('lightning-timepicker');
    }

    getDatepicker() {
        return this.template.querySelector('lightning-datepicker');
    }

    handleDatepickerFocus() {
        this._dateFocus = true;

        this.interactingState.enter();
    }

    handleTimepickerFocus() {
        this._timeFocus = true;

        this.interactingState.enter();
    }

    handleDatepickerBlur() {
        this._dateFocus = false;

        // timepicker fires focus before datepicker fires blur
        if (!this._timeFocus) {
            this.interactingState.leave();
        }
    }

    handleTimepickerBlur() {
        this._timeFocus = false;

        // datepicker fires focus before timepicker fires blur
        if (!this._dateFocus) {
            this.interactingState.leave();
        }
    }

    handleDateChange(event) {
        event.stopPropagation();

        // for some reason this event is fired without detail from listbox
        if (!event.detail) {
            return;
        }

        this._dateValue = event.detail.value;
        if (this._dateValue) {
            this._timeValue = this._timeValue || getCurrentTime(this.timezone);
        }

        this.updateValue();
    }

    handleTimeChange(event) {
        event.stopPropagation();

        // for some reason this event is fired without detail from listbox
        if (!event.detail) {
            return;
        }

        this._timeValue = event.detail.value;

        this.updateValue();
    }

    updateValue() {
        const dateValue = this._dateValue;
        const timeValue = this._timeValue;

        if (dateValue && timeValue) {
            const dateTimeString = dateValue + TIME_SEPARATOR + timeValue;
            this._value = normalizeFormattedDateTime(
                dateTimeString,
                this.timezone
            );

            this.dispatchChangeEvent();
        } else if (!dateValue) {
            this._value = null;
            this._timeValue = null;

            this.dispatchChangeEvent();
        }
    }

    dispatchChangeEvent() {
        this.dispatchEvent(
            new CustomEvent('change', {
                composed: true,
                bubbles: true,
                detail: {
                    value: this._value,
                },
            })
        );
    }

    normalizeInputValue(value) {
        if (!value || value === '') {
            return null;
        }
        return value;
    }

    setDateAndTimeValues(value) {
        const normalizedValue = normalizeISODateTime(value, this.timezone)
            .isoValue;

        const isDateOnly = normalizedValue && value.indexOf(TIME_SEPARATOR) < 0;
        if (isDateOnly) {
            this._dateValue = value;
            this._value = this._dateValue;

            return;
        }

        const dateAndTime = this.separateDateTime(normalizedValue);
        this._dateValue = dateAndTime && dateAndTime[0];
        this._timeValue = dateAndTime && dateAndTime[1];
        this._value = normalizedValue;
    }

    calculateFormattedMinValue() {
        if (!this.min) {
            return;
        }

        const normalizedDate = normalizeISODateTime(this.min, this.timezone);
        this._dateMin = this.separateDateTime(normalizedDate.isoValue)[0];
        this.formattedMin = normalizedDate.displayValue;
    }

    calculateFormattedMaxValue() {
        if (!this.max) {
            return;
        }

        const normalizedDate = normalizeISODateTime(this.max, this.timezone);
        this._dateMax = this.separateDateTime(normalizedDate.isoValue)[0];
        this.formattedMax = normalizedDate.displayValue;
    }

    separateDateTime(isoString) {
        return typeof isoString === 'string'
            ? isoString.split(TIME_SEPARATOR)
            : null;
    }

    formatString(str, ...args) {
        return str.replace(/{(\d+)}/g, (match, i) => {
            return args[i];
        });
    }
}

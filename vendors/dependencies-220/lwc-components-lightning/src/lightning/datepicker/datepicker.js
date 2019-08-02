import labelInvalidDate from '@salesforce/label/LightningDateTimePicker.invalidDate';
import labelRangeOverflow from '@salesforce/label/LightningDateTimePicker.rangeOverflow';
import labelRangeUnderflow from '@salesforce/label/LightningDateTimePicker.rangeUnderflow';
import labelRequired from '@salesforce/label/LightningControl.required';
import labelSelectDate from '@salesforce/label/LightningDateTimePicker.selectDate';
import { LightningElement, track, api } from 'lwc';
import {
    parseDateTime,
    getLocale,
    normalizeISODate,
    normalizeFormattedDate,
} from 'lightning/internationalizationLibrary';
import { STANDARD_DATE_FORMAT } from 'lightning/iso8601Utils';
import {
    startPositioning,
    stopPositioning,
    Direction,
} from 'lightning/positionLibrary';
import { classSet } from 'lightning/utils';
import {
    normalizeBoolean,
    normalizeAriaAttribute,
    normalizeString,
    synchronizeAttrs,
    getRealDOMId,
} from 'lightning/utilsPrivate';
import {
    generateUniqueId,
    InteractingState,
    normalizeVariant,
    VARIANT,
} from 'lightning/inputUtils';
import {
    handleKeyDownOnDatePickerIcon,
    handleBasicKeyDownBehaviour,
} from './keyboard';

const i18n = {
    invalidDate: labelInvalidDate,
    rangeOverflow: labelRangeOverflow,
    rangeUnderflow: labelRangeUnderflow,
    required: labelRequired,
    selectDate: labelSelectDate,
};

const ARIA_CONTROLS = 'aria-controls';
const ARIA_LABEL = 'aria-label';
const ARIA_LABELLEDBY = 'aria-labelledby';
const ARIA_DESCRIBEDBY = 'aria-describedby';
const DATE_STYLE = {
    SHORT: 'short',
    MEDIUM: 'medium',
    LONG: 'long',
};

export default class LightningDatePicker extends LightningElement {
    static delegatesFocus = true;

    @track _disabled = false;
    @track _readonly = false;
    @track _required = false;
    @track _value = null;
    @track _calendarVisible = false;
    @track _displayValue = null;
    @track _errorMessage = '';
    @track _fieldLevelHelp;
    @track _variant;

    @api label;
    @api name;
    @api max;
    @api min;
    @api placeholder;
    @api autocomplete;

    @api messageWhenValueMissing;

    @api
    get messageWhenBadInput() {
        return (
            this._messageWhenBadInput ||
            this.formatString(this.i18n.invalidDate, this.dateFormat)
        );
    }
    set messageWhenBadInput(message) {
        this._messageWhenBadInput = message;
    }

    @api
    get messageWhenRangeOverflow() {
        return (
            this._messageWhenRangeOverflow ||
            this.formatString(this.i18n.rangeOverflow, this.max)
        );
    }
    set messageWhenRangeOverflow(message) {
        this._messageWhenRangeOverflow = message;
    }

    @api
    get messageWhenRangeUnderflow() {
        return (
            this._messageWhenRangeUnderflow ||
            this.formatString(this.i18n.rangeUnderflow, this.min)
        );
    }
    set messageWhenRangeUnderflow(message) {
        this._messageWhenRangeUnderflow = message;
    }

    // setter is required to properly trigger update
    @api
    get ariaLabel() {
        return this._ariaLabel;
    }

    set ariaLabel(val) {
        this._ariaLabel = val;
        this.synchronizeA11y();
    }

    _ariaLabelledBy;
    _ariaControls;
    _ariaDescribedBy = [];

    set ariaLabelledByElement(el) {
        this._ariaLabelledBy = el;
        this.synchronizeA11y();
    }

    @api
    get ariaLabelledByElement() {
        return this._ariaLabelledBy;
    }

    set ariaControlsElement(el) {
        this._ariaControls = el;
        this.synchronizeA11y();
    }

    @api
    get ariaControlsElement() {
        return this._ariaControls;
    }

    set ariaDescribedByElements(el) {
        if (Array.isArray(el)) {
            this._ariaDescribedBy = el;
        } else {
            this._ariaDescribedBy = [el];
        }
        this.synchronizeA11y();
    }

    @api
    get ariaDescribedByElements() {
        return this._ariaDescribedBy;
    }

    get ariaLabelledbyId() {
        return getRealDOMId(this._ariaLabelledBy);
    }

    get ariaControlsId() {
        return getRealDOMId(this.ariaControlsElement);
    }

    synchronizeA11y() {
        const input = this.template.querySelector('input');
        if (!input) {
            return;
        }

        synchronizeAttrs(input, {
            [ARIA_LABELLEDBY]: this.ariaLabelledbyId,
            [ARIA_DESCRIBEDBY]: this.computedAriaDescribedby,
            [ARIA_CONTROLS]: this.ariaControlsId,
            [ARIA_LABEL]: this._ariaLabel,
        });
    }

    renderedCallback() {
        this.synchronizeA11y();
    }

    @api
    get value() {
        return this._value;
    }
    set value(newValue) {
        const normalizedValue = this.normalizeInputValue(newValue);
        if (normalizedValue !== this._value) {
            const normalizedDate = normalizeISODate(
                normalizedValue,
                this.dateFormat
            );

            this._value = normalizedDate.isoValue;
            this._displayValue = normalizedDate.displayValue;
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
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (this.connected) {
            this.inputElement.focus();
        }
    }

    /**
     * Removes keyboard focus from the input element.
     */
    @api
    blur() {
        if (this.connected) {
            this.inputElement.blur();
        }
    }

    @api
    showHelpMessage(message) {
        if (!message) {
            this.classList.remove('slds-has-error');
            this._errorMessage = '';
        } else {
            this.classList.add('slds-has-error');
            this._errorMessage = message;
        }
    }

    @api
    hasBadInput() {
        return !!this._displayValue && this._value === null;
    }

    @api
    get dateStyle() {
        return this._dateStyle;
    }

    set dateStyle(value) {
        this._dateStyle = normalizeString(value, {
            fallbackValue: DATE_STYLE.MEDIUM,
            validValues: [DATE_STYLE.SHORT, DATE_STYLE.MEDIUM, DATE_STYLE.LONG],
        });
        this.dateFormat = this.getDateFormatFromStyle(this._dateStyle);

        const normalizedDate = normalizeISODate(this._value, this.dateFormat);
        this._displayValue = normalizedDate.displayValue;
    }

    constructor() {
        super();
        this.uniqueId = generateUniqueId();
    }

    connectedCallback() {
        this.connected = true;

        this.keyboardInterface = this.datepickerKeyboardInterface();
        this.documentClickHandler = this.getClickHandler.bind(this);

        this.interactingState = new InteractingState({
            debounceInteraction: true,
        });

        this.interactingState.onenter(() => {
            this.dispatchEvent(new CustomEvent('focus'));
        });

        this.interactingState.onleave(() => {
            if (this.connected) {
                this.dispatchEvent(new CustomEvent('blur'));
            }
        });
    }

    disconnectedCallback() {
        this.connected = false;

        // make sure the click handler has been removed from the document
        document.removeEventListener('click', this.documentClickHandler);
    }

    get i18n() {
        return i18n;
    }

    get isLabelHidden() {
        return this.variant === VARIANT.LABEL_HIDDEN;
    }

    get computedLabelClass() {
        return classSet('slds-form-element__label')
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    get computedUniqueErrorMessageElementId() {
        const el = this.template.querySelector('[data-error-message]');
        return getRealDOMId(el);
    }

    get isCalendarVisible() {
        return this._calendarVisible;
    }

    get displayValue() {
        return this._displayValue;
    }

    get errorMessage() {
        return this._errorMessage;
    }

    get computedIconDisabledState() {
        return this.disabled || this.readOnly;
    }

    get computedAriaDescribedby() {
        const ariaValues = [];

        if (this.errorMessage) {
            ariaValues.push(this.computedUniqueErrorMessageElementId);
        }

        this._ariaDescribedBy.forEach(item => {
            const id = getRealDOMId(item);
            if (id) {
                ariaValues.push(id);
            }
        });

        return normalizeAriaAttribute(ariaValues);
    }

    handleInputChange(event) {
        event.stopPropagation();

        // keeping the display value in sync with the element's value
        this._displayValue = event.currentTarget.value;
        this._value = this.parseFormattedDate(this._displayValue);

        this.dispatchChangeEvent();
    }

    handleInput() {
        // IE11 fires an input event along with the click event when the element has a placeholder.
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/101220/
        // remove this block when we stop support for IE11
        const normalizedInputValue = this.normalizeInputValue(
            this.inputElement.value
        );
        if (this._displayValue === normalizedInputValue) {
            return;
        }

        // keeping the display value in sync with the element's value
        this._displayValue = this.inputElement.value;

        // Making sure that the focus remains on the input and we're not triggering leave
        this.hideCalendarAndFocusTrigger();
    }

    handleInputFocus() {
        this.interactingState.enter();
    }

    handleInputBlur() {
        if (!this.isCalendarVisible) {
            if (this._value !== null) {
                const normalizedDate = normalizeISODate(
                    this._value,
                    this.dateFormat
                );
                this._displayValue = normalizedDate.displayValue;
            }
            this.interactingState.leave();
        }
    }

    handleInputClick(event) {
        if (this.readOnly) {
            return;
        }

        this.calendarTrigger = event.target;

        this.showCalendar();
    }

    handleIconBlur() {
        if (!this.isCalendarVisible) {
            this.interactingState.leave();
        }
    }

    handleIconFocus() {
        this.interactingState.enter();
    }

    handleDatePickerIconClick(event) {
        if (this.readOnly || this.disabled) {
            return;
        }

        this.calendarTrigger = event.target;

        this.showAndFocusCalendar();
    }

    handleInputKeydown(event) {
        this.calendarTrigger = event.target;

        handleBasicKeyDownBehaviour(event, this.keyboardInterface);
    }

    handleDatePickerIconKeyDown(event) {
        this.calendarTrigger = event.target;

        handleKeyDownOnDatePickerIcon(event, this.keyboardInterface);
    }

    handleCalendarKeyDown(event) {
        handleBasicKeyDownBehaviour(event, this.keyboardInterface);
    }

    handleDateSelect(event) {
        event.stopPropagation();

        this._value = event.detail.value;

        this._displayValue = normalizeISODate(
            this._value,
            this.dateFormat
        ).displayValue;

        this.hideCalendarAndFocusTrigger();

        this.dispatchChangeEvent();
    }

    showAndFocusCalendar() {
        this.showCalendar();

        requestAnimationFrame(() => {
            this.focusCalendar();
        });
    }

    hideCalendarAndFocusTrigger() {
        this.hideCalendar();

        this.calendarTrigger.focus();
        // in the case where the input already has focus, we should re-enter to make sure we are not triggering leave
        this.interactingState.enter();
    }

    focusCalendar() {
        const calendar = this.template.querySelector('lightning-calendar');
        if (calendar) {
            calendar.focus();
        }
    }

    startPositioning() {
        if (!this._relationship) {
            this._relationship = startPositioning(this, {
                target: () => this.template.querySelector('input'),
                element: () =>
                    this.template
                        .querySelector('lightning-calendar')
                        .shadowRoot.querySelector('div'),
                align: {
                    horizontal: Direction.Right,
                    vertical: Direction.Top,
                },
                targetAlign: {
                    horizontal: Direction.Right,
                    vertical: Direction.Bottom,
                },
                autoFlip: true, // Auto flip direction if not have enough space
                leftAsBoundary: true, // horizontal flip uses target left as boundary
            });
        } else {
            this._relationship.reposition();
        }
    }

    stopPositioning() {
        if (this._relationship) {
            stopPositioning(this._relationship);
            this._relationship = null;
        }
    }

    showCalendar() {
        if (!this.isCalendarVisible) {
            this.interactingState.enter();

            // Async bind the click handler because we are currently handling a
            // click event and we don't want to immediately close the calendar.
            requestAnimationFrame(() => {
                this.addDocumentClickHandler();
            });

            this.rootElement.classList.add('slds-is-open');

            this._calendarVisible = true;
        }
    }

    hideCalendar() {
        if (this.isCalendarVisible) {
            this.removeDocumentClickHandler();

            this.rootElement.classList.remove('slds-is-open');

            this.stopPositioning();
            this._calendarVisible = false;

            this.interactingState.leave();
        }
    }

    get rootElement() {
        return this.template.querySelector('div');
    }

    get inputElement() {
        return this.template.querySelector('input');
    }

    get dateFormat() {
        if (!this._dateFormat) {
            this._dateFormat = this.getDateFormatFromStyle();
        }
        return this._dateFormat;
    }

    set dateFormat(value) {
        this._dateFormat = value;
    }

    getDateFormatFromStyle(dateStyle) {
        let dateFormat;
        switch (dateStyle) {
            case DATE_STYLE.SHORT:
                dateFormat = getLocale().shortDateFormat;
                break;
            case DATE_STYLE.LONG:
                dateFormat = getLocale().longDateFormat;
                break;
            default:
                dateFormat = getLocale().dateFormat;
                break;
        }

        return dateFormat;
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

    addDocumentClickHandler() {
        document.addEventListener('click', this.documentClickHandler);
    }

    removeDocumentClickHandler() {
        document.removeEventListener('click', this.documentClickHandler);
    }

    getClickHandler(event) {
        const rootElement = this.rootElement;
        if (!rootElement.contains(event.target)) {
            this.hideCalendar();
        }
    }

    datepickerKeyboardInterface() {
        const that = this;
        return {
            showCalendar() {
                that.showAndFocusCalendar();
            },
            hideCalendar() {
                that.hideCalendarAndFocusTrigger();
            },
            isCalendarVisible() {
                return that.isCalendarVisible;
            },
        };
    }

    normalizeInputValue(value) {
        if (!value || value === '') {
            return null;
        }
        return value;
    }

    parse(dateString) {
        // We cannot use parseDateTimeISO8601 here because that method does not have a strict flag. If the value is not an ISO string, that method will parse using the native Date()
        // Alternatively we could call isValidISODateTimeString and then parseDateTimeISO8601.
        return parseDateTime(dateString, STANDARD_DATE_FORMAT, true);
    }

    get allowedDateFormats() {
        // this method can't be static because at the time this file is interpreted,
        // getLocale don't have the injected Locale in the config provider.
        const locale = getLocale();

        // We should prioritize the long, because a long date matched with the medium format. An issue in aura?
        // Ex: September 8, 2017 when be parsed with the medium format, returns a valid iso date.
        return [
            locale.longDateFormat,
            locale.dateFormat,
            locale.shortDateFormat,
        ];
    }

    /**
     * Parses the input date and sets the dateFormat used to parse the displayValue
     * if it is a valid Date.
     *
     * @param {String} displayValue - The input date.
     * @return {null | string} - A normalized formatted date if displayValue is valid. null otherwise.
     */
    parseFormattedDate(displayValue) {
        const allowedFormats = this.allowedDateFormats;
        const n = allowedFormats.length;
        let i = 0,
            value = null;

        do {
            value = normalizeFormattedDate(displayValue, allowedFormats[i]);
            i++;
        } while (value === null && i < n);

        return value;
    }

    formatString(str, ...args) {
        return str.replace(/{(\d+)}/g, (match, i) => {
            return args[i];
        });
    }
}

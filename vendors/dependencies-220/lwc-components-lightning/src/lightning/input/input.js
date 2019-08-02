import labelA11yTriggerText from '@salesforce/label/LightningColorPicker.a11yTriggerText';
import labelInputFileBodyText from '@salesforce/label/LightningInputFile.bodyText';
import labelInputFileButtonLabel from '@salesforce/label/LightningInputFile.buttonLabel';
import labelMessageToggleActive from '@salesforce/label/LightningControl.activeCapitalized';
import labelMessageToggleInactive from '@salesforce/label/LightningControl.inactiveCapitalized';
import labelRequired from '@salesforce/label/LightningControl.required';
import labelClearInput from '@salesforce/label/LightningControl.clear';
import labelLoadingIndicator from '@salesforce/label/LightningControl.loading';
import { LightningElement, unwrap, track, api } from 'lwc';
import { classSet } from 'lightning/utils';
import {
    assert,
    normalizeBoolean,
    normalizeString,
    normalizeAriaAttribute,
    keyCodes,
    synchronizeAttrs,
    isIE11,
    ContentMutation,
    getRealDOMId,
    classListMutation,
} from 'lightning/utilsPrivate';
import { getFormFactor } from 'lightning/configProvider';
import {
    normalizeInput,
    normalizeDate,
    normalizeTime,
    normalizeUTCDateTime,
    normalizeDateTimeToUTC,
} from './normalize';
import {
    getLocale,
    numberFormat,
    isBefore,
    isAfter,
} from 'lightning/internationalizationLibrary';
import {
    isEmptyString,
    InteractingState,
    FieldConstraintApiWithProxyInput,
    normalizeVariant,
    VARIANT,
} from 'lightning/inputUtils';

const i18n = {
    a11yTriggerText: labelA11yTriggerText,
    inputFileBodyText: labelInputFileBodyText,
    inputFileButtonLabel: labelInputFileButtonLabel,
    messageToggleActive: labelMessageToggleActive,
    messageToggleInactive: labelMessageToggleInactive,
    required: labelRequired,
    clear: labelClearInput,
    loading: labelLoadingIndicator,
};

const ARIA_CONTROLS = 'aria-controls';
const ARIA_LABEL = 'aria-label';
const ARIA_LABELEDBY = 'aria-labelledby';
const ARIA_DESCRIBEDBY = 'aria-describedby';

/*
* This component supports the regular native input types, with the addition of toggle, checkbox-button and color.
* Furthermore the file type supports a droppable zone, search has a clear button, number has formatting.
* Input changes (native oninput event) triggers an onchange event,
*     the native even is stopped, the dispatched custom event has a value that points to the state of the component
*     in case of files it's the files uploaded (via droppable zone or through the upload button),
*     checked for radio and checkbox, checkbox-button, and just straight input's value for everything else
*
*
* _Toggle_ (always has an aria-describedby, on error has an additional one, default label text for active and inactive
* states)
* _File_ (as it has a droppable zone, the validity returned would have to be valid - unless a custom error message was
*    passed)
* _Search_ (it has the clear button and the icon)
* _Number_ (formatting when not in focus, when in focus shows raw value)
*
* */

const VALID_NUMBER_FORMATTERS = [
    'decimal',
    'percent',
    'percent-fixed',
    'currency',
];
const DEFAULT_COLOR = '#000000';
const DEFAULT_FORMATTER = VALID_NUMBER_FORMATTERS[0];

/**
 * Returns an aria string with all the non-autolinked values removed
 * @param {String} values space sperated list of ids
 * @returns {String} The aria values with the non-auto linked ones removed
 */
function filterNonAutoLink(values) {
    const ariaValues = values.split(/\s+/);
    return ariaValues
        .filter(value => {
            return !!value.match(/^auto-link/);
        })
        .join(' ');
}

/**
 * Represents interactive controls that accept user input depending on the type attribute.
 */
export default class LightningInput extends LightningElement {
    static delegatesFocus = true;

    /**
     * Text that is displayed when the field is empty, to prompt the user for a valid entry.
     * @type {string}
     *
     */
    @api placeholder;

    /**
     * Specifies the name of an input element.
     * @type {string}
     *
     */
    @api name;

    /**
     * Text label for the input.
     * @type {string}
     * @required
     *
     */
    @api label;

    /**
     * Error message to be displayed when a bad input is detected.
     * @type {string}
     *
     */
    @api messageWhenBadInput;

    /**
     * Error message to be displayed when a pattern mismatch is detected.
     * @type {string}
     *
     */
    @api messageWhenPatternMismatch;

    /**
     * Error message to be displayed when a range overflow is detected.
     * @type {string}
     *
     */
    @api messageWhenRangeOverflow;

    /**
     * Error message to be displayed when a range underflow is detected.
     * @type {string}
     *
     */
    @api messageWhenRangeUnderflow;

    /**
     * Error message to be displayed when a step mismatch is detected.
     * @type {string}
     *
     */
    @api messageWhenStepMismatch;

    /**
     * Error message to be displayed when the value is too short.
     * @type {string}
     *
     */
    @api messageWhenTooShort;

    /**
     * Error message to be displayed when the value is too long.
     * @type {string}
     *
     */
    @api messageWhenTooLong;

    /**
     * Error message to be displayed when a type mismatch is detected.
     * @type {string}
     *
     */
    @api messageWhenTypeMismatch;

    /**
     * Error message to be displayed when the value is missing.
     * @type {string}
     *
     */
    @api messageWhenValueMissing;

    /**
     * Text shown for the active state of a toggle. The default is "Active".
     * @type {string}
     */
    @api messageToggleActive = i18n.messageToggleActive;

    /**
     * Text shown for the inactive state of a toggle. The default is "Inactive".
     * @type {string}
     */
    @api messageToggleInactive = i18n.messageToggleInactive;

    /**
     * Describes the input to assistive technologies.
     * @type {string}
     */
    @api ariaLabel;

    /**
     * Controls auto-filling of the field. Use this attribute with
     * email, search, tel, text, and url input types only. Set the attribute to pass
     * through autocomplete values to be interpreted by the browser.
     * @type {string}
     */
    @api autocomplete;

    @track _timeAriaDescribedBy;
    @track _timeAriaLabelledBy;
    @track _timeAriaControls;
    @track _dateAriaControls;
    @track _dateAriaDescribedBy;
    @track _dateAriaLabelledBy;
    @track _value = '';
    @track _type = 'text';
    @track _pattern;
    @track _max;
    @track _min;
    @track _step;
    @track _disabled = false;
    @track _readOnly = false;
    @track _required = false;
    @track _checked = false;
    @track _isLoading = false;
    @track _multiple = false;
    @track _timezone = false;
    @track _helpMessage = null;
    @track _isColorPickerPanelOpen = false;
    @track _fieldLevelHelp;
    @track _accesskey;
    @track _maxLength;
    @track _minLength;
    @track _accept;
    @track _variant;
    @track _connected;

    _formatter = DEFAULT_FORMATTER;
    _showRawNumber = false;
    _initialValueSet = false;
    _files = null;

    constructor() {
        super();
        this.ariaObserver = new ContentMutation(this);

        // Native Shadow Root will return [native code].
        // Our synthetic method will return the function source.
        this.isNative = this.template.querySelector
            .toString()
            .match(/\[native code\]/);
    }

    /**
     * Reserved for internal use.
     * @type {number}
     *
     */
    @api
    get formatFractionDigits() {
        return this._formatFractionDigits;
    }

    set formatFractionDigits(value) {
        this._formatFractionDigits = value;
        if (this._connected && this.isTypeNumber) {
            this.inputElement.value = this.displayedValue;
        }
    }

    set timeAriaControls(refs) {
        this._timeAriaControls = refs;
        this.ariaObserver.connectLiveIdRef(refs, ref => {
            this._timeAriaControls = ref;
        });
    }

    /**
     * A space-separated list of element IDs whose presence or content is controlled by the
     * time input when type='datetime'. On mobile devices, this is merged with aria-controls
     * and date-aria-controls to describe the native date time input.
     * @type {string}
     */
    @api
    get timeAriaControls() {
        return this._timeAriaControls;
    }

    /**
     * The display style of the date when type='date' or type='datetime'. Valid values are
     * short, medium (default), and long. The format of each style is specific to the locale.
     * On mobile devices this attribute has no effect.
     * @type {string}
     * @default medium
     */
    @api dateStyle;

    /**
     * The display style of the time when type='time' or type='datetime'. Valid values are
     * short (default), medium, and long. Currently, medium and long styles look the same.
     * On mobile devices this attribute has no effect.
     * @type {string}
     * @default short
     *
     */
    @api timeStyle;

    /**
     * Describes the date input to assistive technologies when type='datetime'. On mobile devices,
     * this label is merged with aria-label and time-aria-label to describe the native date time input.
     * @type {string}
     *
     */
    @api dateAriaLabel;

    set dateAriaLabelledBy(refs) {
        this._dateAriaLabelledBy = refs;
        this.ariaObserver.connectLiveIdRef(refs, ref => {
            this._dateAriaLabelledBy = ref;
        });
    }

    /**
     * A space-separated list of element IDs that provide labels for the date input when type='datetime'.
     * On mobile devices, this is merged with aria-labelled-by and time-aria-labelled-by to describe
     * the native date time input.
     * @type {string}
     */
    @api
    get dateAriaLabelledBy() {
        return this._dateAriaLabelledBy;
    }

    set timeAriaLabelledBy(refs) {
        this._timeAriaLabelledBy = refs;
        this.ariaObserver.connectLiveIdRef(refs, ref => {
            this._timeAriaLabelledBy = ref;
        });
    }

    /**
     * A space-separated list of element IDs that provide labels for the time input when type='datetime'.
     * On mobile devices, this is merged with aria-labelled-by and date-aria-labelled-by to describe
     * the native date time input.
     * @type {string}
     *
     */
    @api
    get timeAriaLabelledBy() {
        return this._timeAriaLabelledBy;
    }

    set timeAriaDescribedBy(refs) {
        this._timeAriaDescribedBy = refs;
        this.ariaObserver.connectLiveIdRef(refs, ref => {
            this._timeAriaDescribedBy = ref;
        });
    }

    /**
     * A space-separated list of element IDs that provide descriptive labels for the time input when
     * type='datetime'. On mobile devices, this is merged with aria-described-by and date-aria-described-by
     * to describe the native date time input.
     *  @type {string}
     *
     */
    @api
    get timeAriaDescribedBy() {
        return this._timeAriaDescribedBy;
    }

    set dateAriaControls(refs) {
        this._dateAriaControls = refs;
        this.ariaObserver.connectLiveIdRef(refs, ref => {
            this._dateAriaControls = ref;
        });
    }

    /**
     * A space-separated list of element IDs whose presence or content is controlled by the
     * date input when type='datetime'. On mobile devices, this is merged with aria-controls
     * and time-aria-controls to describe the native date time input.
     * @type {string}
     *
     */
    @api
    get dateAriaControls() {
        return this._dateAriaControls;
    }

    set dateAriaDescribedBy(refs) {
        this._dateAriaDescribedBy = refs;
        this.ariaObserver.connectLiveIdRef(refs, ref => {
            this._dateAriaDescribedBy = ref;
        });
    }

    /**
     * A space-separated list of element IDs that provide descriptive labels for the date input when
     * type='datetime'. On mobile devices, this is merged with aria-described-by and time-aria-described-by
     * to describe the native date time input.
     * @type {string}
     */
    @api
    get dateAriaDescribedBy() {
        return this._dateAriaDescribedBy;
    }

    set ariaControls(refs) {
        this._ariaControls = refs;
        this.ariaObserver.link('input', 'aria-controls', refs, '[data-aria]');
    }

    /**
     * A space-separated list of element IDs whose presence or content is controlled by the input.
     * @type {string}
     */
    @api
    get ariaControls() {
        return this._ariaControls;
    }

    set ariaLabelledBy(refs) {
        this._ariaLabelledBy = refs;
        this.ariaObserver.link('input', 'aria-labelledby', refs, '[data-aria]');
    }

    /**
     * A space-separated list of element IDs that provide labels for the input.
     * @type {string}
     */
    @api
    get ariaLabelledBy() {
        // native version returns the auto linked value
        if (this.isNative) {
            const ariaValues = this.template
                .querySelector('input')
                .getAttribute('aria-labelledby');
            return filterNonAutoLink(ariaValues);
        }
        return this._ariaLabelledBy;
    }

    set ariaDescribedBy(refs) {
        this._ariaDescribedBy = refs;
        this.ariaObserver.link(
            'input',
            'aria-describedby',
            refs,
            '[data-aria]'
        );
    }

    /**
     * A space-separated list of element IDs that provide descriptive labels for the input.
     * @type {string}
     */
    @api
    get ariaDescribedBy() {
        if (this.isNative) {
            // in native case return the linked value
            const ariaValues = this.template
                .querySelector('input')
                .getAttribute('aria-describedby');
            return filterNonAutoLink(ariaValues);
        }
        return this._ariaDescribedBy;
    }

    synchronizeA11y() {
        const input = this.template.querySelector('input');
        const datepicker = this.template.querySelector('lightning-datepicker');
        const timepicker = this.template.querySelector('lightning-timepicker');

        if (datepicker) {
            synchronizeAttrs(datepicker, {
                ariaLabelledByElement: this.ariaLabelledBy,
                ariaDescribedByElements: this.ariaDescribedBy,
                ariaControlsElement: this.ariaControls,
                [ARIA_LABEL]: this.computedAriaLabel,
            });
            return;
        }

        if (timepicker) {
            synchronizeAttrs(timepicker, {
                ariaLabelledByElement: this.ariaLabelledBy,
                ariaDescribedByElements: this.ariaDescribedBy,
                ariaControlsElement: this.ariaControls,
                [ARIA_LABEL]: this.computedAriaLabel,
            });
            return;
        }

        if (!input) {
            return;
        }

        synchronizeAttrs(input, {
            [ARIA_LABELEDBY]: this.computedAriaLabelledBy,
            [ARIA_DESCRIBEDBY]: this.computedAriaDescribedBy,
            [ARIA_CONTROLS]: this.computedAriaControls,
            [ARIA_LABEL]: this.computedAriaLabel,
        });
    }

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.updateClassList();
        this.validateRequiredAttributes();

        this._connected = true;

        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.reportValidity());
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
        this._initialValueSet = false;
        this._inputElement = undefined;
    }

    renderedCallback() {
        if (!this._initialValueSet && this.inputElement) {
            this.inputElement.value = this.displayedValue;
            if (this.isTypeCheckable) {
                this.inputElement.checked = this._checked;
            }
            this._initialValueSet = true;
        }

        this.ariaObserver.sync();
        this.synchronizeA11y();
    }

    /**
     * String value with the formatter to be used for number input. Valid values include
     * decimal, percent, percent-fixed, and currency.
     * @type {string}
     */
    @api
    get formatter() {
        return this._formatter;
    }

    set formatter(value) {
        this._formatter = normalizeString(value, {
            fallbackValue: DEFAULT_FORMATTER,
            validValues: VALID_NUMBER_FORMATTERS,
        });
        this._updateInputDisplayValueIfTypeNumber();
    }

    /**
     * The type of the input. This value defaults to text.
     * @type {string}
     * @default text
     */
    @api
    get type() {
        return this._type;
    }

    set type(value) {
        const normalizedValue = normalizeString(value);
        this._type =
            normalizedValue === 'datetime' ? 'datetime-local' : normalizedValue;

        this.validateType(normalizedValue);

        this._inputElementRefreshNeeded = true;

        if (this._connected) {
            // The type is being changed after render, which means the input element may be different (eg. changing
            // from text to 'checkbox', so we need to set the initial value again
            this._initialValueSet = false;
        }

        this._updateProxyInputAttributes([
            'type',
            'value',
            'max',
            'min',
            'required',
            'pattern',
        ]);
    }

    /**
     * For the search type only. If present, a spinner is displayed to indicate that data is loading.
     * @type {boolean}
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * Specifies the regular expression that the input's value is checked against.
     * This attribute is supported for email, password, search, tel, text, and url types.
     * @type {string}
     *
     */
    @api
    get pattern() {
        if (this.isTypeColor) {
            return '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$';
        }
        return this._pattern;
    }

    set pattern(value) {
        this._pattern = value;
        this._updateProxyInputAttributes('pattern');
    }

    /**
     * The maximum number of characters allowed in the field.
     * Use this attribute with email, password, search, tel, text, and url input types only.
     * @type {number}
     */
    @api
    get maxLength() {
        return this._maxLength;
    }

    set maxLength(value) {
        this._maxLength = value;
        this._updateProxyInputAttributes('maxlength');
    }

    /**
     * Specifies the types of files that the server accepts. Use this attribute with file input type only.
     * @type {string}
     */
    @api
    get accept() {
        return this._accept;
    }

    set accept(value) {
        this._accept = value;
        this._updateProxyInputAttributes('accept');
    }

    /**
     * The minimum number of characters allowed in the field.
     * Use this attribute with email, password, search, tel, text, and url input types only.
     * @type {number}
     */
    @api
    get minLength() {
        return this._minLength;
    }

    set minLength(value) {
        this._minLength = value;
        this._updateProxyInputAttributes('minlength');
    }

    // number and date/time
    /**
     * The maximum acceptable value for the input.  Use this attribute with number,
     * range, date, time, and datetime input types only. For number and range type, the max value is a
     * decimal number. For the date, time, and datetime types, the max value must use a valid string for the type.
     * @type {decimal|string}
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = value;
        this._updateProxyInputAttributes('max');
    }

    /**
     * The minimum acceptable value for the input. Use this attribute with number,
     * range, date, time, and datetime input types only. For number and range types, the min value
     * is a decimal number. For the date, time, and datetime types, the min value must use a valid string for the type.
     * @type {decimal|string}
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = value;
        this._updateProxyInputAttributes('min');
    }

    /**
     * Granularity of the value, specified as a positive floating point number.
     * Use this attribute with number and range input types only.
     * Use 'any' when granularity is not a concern. This value defaults to 1.
     * @type {decimal|string}
     * @default 1
     */
    @api
    get step() {
        const stepNotSupportedYet = this.isTypeDateTime || this.isTypeTime;
        // The step attribute is broken on IE11; e.g. 123.45 with step=0.01 returns stepMismatch. See W-5356698 for details.
        const nativeStepBroken = this.isTypeNumber && isIE11;
        if (stepNotSupportedYet || nativeStepBroken) {
            return 'any';
        }
        return this._step;
    }

    set step(value) {
        this._step = normalizeInput(value);
        this._updateProxyInputAttributes('step');
        this._calculateFractionDigitsFromStep(value);
        this._updateInputDisplayValueIfTypeNumber();
    }

    /**
     * If present, the checkbox is selected.
     * @type {boolean}
     * @default false
     */
    @api
    get checked() {
        // checkable inputs can be part of a named group, in that case there won't be a change event thrown and so
        // the internal tracking _checked would be out of sync with the actual input value.
        if (this.isTypeCheckable && this._initialValueSet) {
            return this.inputElement.checked;
        }
        return this._checked;
    }

    set checked(value) {
        this._checked = normalizeBoolean(value);
        this._updateProxyInputAttributes('checked');
        if (this._connected) {
            this.inputElement.checked = this._checked;
        }
    }

    /**
     * Specifies that a user can enter more than one value. Use this attribute with file and email input types only.
     * @type {boolean}
     * @default false
     */
    @api
    get multiple() {
        return this._multiple;
    }

    set multiple(value) {
        this._multiple = normalizeBoolean(value);
        this._updateProxyInputAttributes('multiple');
    }

    /**
     * Specifies the value of an input element.
     * @type {object}
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = normalizeInput(value);
        this._updateProxyInputAttributes('value');
        // Setting value of a type file isn't allowed, but due to the design of Aura/LWC interop layer
        // it will try to set the value after a change event
        if (!this.isTypeFile) {
            // Again, due to the interop layer we need to check whether the value being set
            // is different, otherwise we're duplicating the sets on the input, which result
            // in different bugs like Japanese IME duplication of characters in Safari (likely a browser bug) or
            // character position re-set in IE11.
            if (
                this._connected &&
                this.inputElement.value !== this.displayedValue
            ) {
                this.inputElement.value = this.displayedValue;
            }
        }
    }

    /**
     * The variant changes the appearance of an input field.
     * Accepted variants include standard, label-inline, label-hidden, and label-stacked.
     * This value defaults to standard, which displays the label above the field.
     * Use label-hidden to hide the label but make it available to assistive technology.
     * Use label-inline to horizontally align the label and input field.
     * Use label-stacked to place the label above the input field.
     * @type {string}
     * @default standard
     */
    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(value) {
        this._variant = normalizeVariant(value);
        this.updateClassList();
    }

    /**
     * If present, the input field is disabled and users cannot interact with it.
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
        this._updateProxyInputAttributes('disabled');
    }

    /**
     * If present, the input field is read-only and cannot be edited by users.
     * @type {boolean}
     * @default false
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
        this._updateProxyInputAttributes('readonly');
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     * @type {boolean}
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
        this._updateProxyInputAttributes('required');
    }

    /**
     * Specifies the time zone used when type='datetime' only. This value defaults to the user's Salesforce time zone setting.
     * @type {string}
     *
     */
    @api
    get timezone() {
        return this._timezone || getLocale().timezone;
    }

    set timezone(value) {
        this._timezone = value;
        // mobile date/time normalization of value/max/min depends on timezone, so we need to update here as well
        this._updateProxyInputAttributes(['value', 'max', 'min']);
    }

    /**
     * A FileList that contains selected files. Use this attribute with the file input type only.
     * @type {object}
     *
     */
    @api
    get files() {
        if (this.isTypeFile) {
            return unwrap(this._files);
        }
        return null;
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     * @type {object}
     *
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Checks if the input is valid.
     * @returns {boolean} Indicates whether the element meets all constraint validations.
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     * @param {string} message - The string that describes the error. If message is an empty string, the error message is reset.
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     * @returns {boolean} - The validity status of the input fields.
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity(message => {
            if (this._connected && !this.isNativeInput) {
                this.inputElement.showHelpMessage(message);
            } else {
                this._helpMessage = message;
            }
        });
    }

    get isNativeInput() {
        return !(
            this.isTypeDesktopDate ||
            this.isTypeDesktopDateTime ||
            this.isTypeDesktopTime
        );
    }

    set fieldLevelHelp(value) {
        this._fieldLevelHelp = value;
    }

    /**
     * Help text detailing the purpose and function of the input.
     * This attribute isn't supported for file, radio, toggle, and checkbox-button types.
     * @type {string}
     *
     */
    @api
    get fieldLevelHelp() {
        return this._fieldLevelHelp;
    }

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (this._connected) {
            this.inputElement.focus();
        }
    }

    /**
     * Removes keyboard focus from the input element.
     */
    @api
    blur() {
        if (this._connected) {
            this.inputElement.blur();
        }
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    get computedAriaControls() {
        const ariaValues = [];

        // merge all date & time arias on mobile since it's displayed as a single field
        if (this.isTypeMobileDateTime) {
            ariaValues.push(this.dateAriaControls);
            ariaValues.push(this.timeAriaControls);
        }
        if (this.ariaControls) {
            ariaValues.push(this.ariaControls);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    get computedAriaLabel() {
        const ariaValues = [];

        // merge all date & time arias on mobile since it's displayed as a single field
        if (this.isTypeMobileDateTime) {
            ariaValues.push(this.dateAriaLabel);
            ariaValues.push(this.timeAriaLabel);
        }
        if (this.ariaLabel) {
            ariaValues.push(this.ariaLabel);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    get computedAriaLabelledBy() {
        const ariaValues = [];

        if (this.isTypeFile) {
            ariaValues.push(this.computedUniqueFileElementLabelledById);
        }
        // merge all date & time arias on mobile since it's displayed as a single field
        if (this.isTypeMobileDateTime) {
            ariaValues.push(this.dateAriaLabelledBy);
            ariaValues.push(this.timeAriaLabelledBy);
        }
        if (this.ariaLabelledBy) {
            ariaValues.push(this.ariaLabelledBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    get computedAriaDescribedBy() {
        const ariaValues = [];

        if (this._helpMessage) {
            ariaValues.push(this.computedUniqueHelpElementId);
        }
        // The toggle type is described by a secondary element
        if (this.isTypeToggle) {
            ariaValues.push(this.computedUniqueToggleElementDescribedById);
        }
        // merge all date & time arias on mobile since it's displayed as a single field
        if (this.isTypeMobileDateTime) {
            ariaValues.push(this.dateAriaDescribedBy);
            ariaValues.push(this.timeAriaDescribedBy);
        }
        if (this.ariaDescribedBy) {
            ariaValues.push(this.ariaDescribedBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    /**
     * Specifies a shortcut key to activate or focus an element.
     * @type {string}
     *
     */
    @api
    get accessKey() {
        return this._accesskey;
    }

    set accessKey(newValue) {
        this._accesskey = newValue;
    }

    get isLabelHidden() {
        return this.variant === VARIANT.LABEL_HIDDEN;
    }

    get isLabelStacked() {
        return this.variant === VARIANT.LABEL_STACKED;
    }

    get accesskey() {
        return this._accesskey;
    }

    get isTypeCheckable() {
        return (
            this.isTypeCheckbox ||
            this.isTypeCheckboxButton ||
            this.isTypeRadio ||
            this.isTypeToggle
        );
    }

    get colorInputElementValue() {
        return this.validity.valid && this.value ? this.value : DEFAULT_COLOR;
    }

    get colorInputStyle() {
        return `background: ${this.value || '#5679C0'};`;
    }

    get computedUniqueHelpElementId() {
        return getRealDOMId(this.template.querySelector('[data-help-message]'));
    }

    get computedUniqueToggleElementDescribedById() {
        if (this.isTypeToggle) {
            const toggle = this.template.querySelector(
                '[data-toggle-description]'
            );
            return getRealDOMId(toggle);
        }
        return null;
    }

    get computedUniqueFormLabelId() {
        if (this.isTypeFile) {
            const formLabel = this.template.querySelector('[data-form-label]');
            return getRealDOMId(formLabel);
        }
        return null;
    }

    get computedUniqueFileSelectorLabelId() {
        if (this.isTypeFile) {
            const fileBodyLabel = this.template.querySelector(
                '[data-file-selector-label]'
            );
            return getRealDOMId(fileBodyLabel);
        }
        return null;
    }

    get computedUniqueFileElementLabelledById() {
        if (this.isTypeFile) {
            const labelIds = [
                this.computedUniqueFormLabelId,
                this.computedUniqueFileSelectorLabelId,
            ];
            return labelIds.join(' ');
        }
        return null;
    }

    get computedFormElementClass() {
        const classes = classSet('slds-form-element__control slds-grow');

        if (this.isTypeSearch) {
            classes.add('slds-input-has-icon slds-input-has-icon_left-right');
        }

        return classes.toString();
    }

    get i18n() {
        return i18n;
    }

    get computedLabelClass() {
        const classnames = classSet('slds-form-element__label');
        if (this.isTypeCheckable || this.isTypeFile) {
            // do nothing
        } else if (this.isTypeToggle) {
            classnames.add('slds-m-bottom_none');
        } else {
            classnames.add('slds-no-flex');
        }
        return classnames
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    get computedNumberClass() {
        return classSet('slds-input')
            .add({ 'slds-is-disabled': this.disabled })
            .toString();
    }

    get computedColorLabelClass() {
        return classSet('slds-color-picker__summary-label')
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    get computedCheckboxClass() {
        return classSet('slds-checkbox')
            .add({ 'slds-checkbox_standalone': !this.isStandardVariant })
            .toString();
    }

    get normalizedMax() {
        return this.normalizeDateTimeString(this.max);
    }

    get normalizedMin() {
        return this.normalizeDateTimeString(this.min);
    }

    get isTypeNumber() {
        return this.type === 'number';
    }

    get isTypeSearch() {
        return this.type === 'search';
    }

    get isTypeToggle() {
        return this.type === 'toggle';
    }

    get isTypeText() {
        return this.type === 'text';
    }

    get isTypeCheckbox() {
        return this.type === 'checkbox';
    }

    get isTypeRadio() {
        return this.type === 'radio';
    }

    get isTypeCheckboxButton() {
        return this.type === 'checkbox-button';
    }

    get isTypeFile() {
        return this.type === 'file';
    }

    get isTypeColor() {
        return this.type === 'color';
    }

    get isTypeDate() {
        return this.type === 'date';
    }

    get isTypeDateTime() {
        return this.type === 'datetime' || this.type === 'datetime-local';
    }

    get isTypeTime() {
        return this.type === 'time';
    }

    get isTypeMobileDate() {
        return this.isTypeDate && !this.isDesktopBrowser();
    }

    get isTypeDesktopDate() {
        return this.isTypeDate && this.isDesktopBrowser();
    }

    get isTypeMobileDateTime() {
        return this.isTypeDateTime && !this.isDesktopBrowser();
    }

    get isTypeDesktopDateTime() {
        return this.isTypeDateTime && this.isDesktopBrowser();
    }

    get isTypeMobileTime() {
        return this.isTypeTime && !this.isDesktopBrowser();
    }

    get isTypeDesktopTime() {
        return this.isTypeTime && this.isDesktopBrowser();
    }

    get isTypeSimple() {
        return (
            !this.isTypeCheckbox &&
            !this.isTypeCheckboxButton &&
            !this.isTypeToggle &&
            !this.isTypeRadio &&
            !this.isTypeFile &&
            !this.isTypeColor &&
            !this.isTypeDesktopDate &&
            !this.isTypeDesktopDateTime &&
            !this.isTypeDesktopTime
        );
    }

    get inputElement() {
        if (!this._connected) {
            return undefined;
        }
        if (!this._inputElement || this._inputElementRefreshNeeded) {
            let inputElement;
            if (this.isTypeDesktopDate) {
                inputElement = this.template.querySelector(
                    'lightning-datepicker'
                );
            } else if (this.isTypeDesktopDateTime) {
                inputElement = this.template.querySelector(
                    'lightning-datetimepicker'
                );
            } else if (this.isTypeDesktopTime) {
                inputElement = this.template.querySelector(
                    'lightning-timepicker'
                );
            } else {
                inputElement = this.template.querySelector('input');
            }
            this._inputElementRefreshNeeded = false;
            this._inputElement = inputElement;
        }
        return this._inputElement;
    }

    get nativeInputType() {
        let inputType = 'text';

        if (this.isTypeSimple) {
            inputType = this.type;
        } else if (
            this.isTypeToggle ||
            this.isTypeCheckboxButton ||
            this.isTypeCheckbox
        ) {
            inputType = 'checkbox';
        } else if (this.isTypeRadio) {
            inputType = 'radio';
        } else if (this.isTypeFile) {
            inputType = 'file';
        } else if (this.isTypeDateTime) {
            inputType = 'datetime-local';
        } else if (this.isTypeTime) {
            inputType = 'time';
        } else if (this.isTypeDate) {
            inputType = 'date';
        }
        return inputType;
    }

    clearAndSetFocusOnInput(event) {
        this.interactingState.enter();

        this.inputElement.value = '';
        this._updateValueAndValidityAttribute('');

        this.dispatchChangeEventWithDetail({
            value: this._value,
        });

        this.inputElement.focus();

        // button is removed from template, but
        // event still is propagated, For example, captured by panel,
        // then cause panel think is clicked outside.
        event.stopPropagation();
    }

    dispatchChangeEventWithDetail(detail) {
        this.dispatchEvent(
            new CustomEvent('change', {
                composed: true,
                bubbles: true,
                detail,
            })
        );
    }

    getFormattedValue(value) {
        if (!this.isTypeNumber) {
            return value;
        }

        if (isEmptyString(value)) {
            return '';
        }

        let formattedValue = value;
        let inputValue = value;

        // set formatter style & default options
        const formatStyle = this.formatter;
        const formatOptions = { style: formatStyle };

        // Use the min/max fraction digits from the formatFractionDigits provided by the user if available.
        // Otherwise, use the number of digits calculated from step
        if (this._formatFractionDigits !== undefined) {
            formatOptions.minimumFractionDigits = this._formatFractionDigits;
            formatOptions.maximumFractionDigits = this._formatFractionDigits;
        } else if (this._calculatedFractionDigits !== undefined) {
            formatOptions.minimumFractionDigits = this._calculatedFractionDigits;
            formatOptions.maximumFractionDigits = this._calculatedFractionDigits;
        }

        if (formatStyle === 'percent-fixed') {
            // percent-fixed just uses percent format and divides the value by 100
            // before passing to the library, this is to deal with the
            // fact that percentages in salesforce are 0-100, not 0-1
            formatOptions.style = 'percent';
            const inputValueAsString = inputValue.toString();
            const normalisedNumberInPercent = parseFloat(inputValue) / 100;

            // If the number contains fraction digits and is not in an exponent format
            if (
                inputValueAsString.indexOf('.') > 0 &&
                inputValueAsString.indexOf('e') < 0
            ) {
                // Depending on the input number, division by 100 may lead to rounding errors
                // (e.g 0.785 / 100 is 0.007850000000000001), so we need to round back
                // to the correct precision, that is - existing number of fractional digits
                // plus extra 2 for division by 100.
                inputValue = normalisedNumberInPercent.toFixed(
                    inputValueAsString.split('.')[1].length + 2
                );
            } else {
                inputValue = normalisedNumberInPercent;
            }
        }

        try {
            formattedValue =
                numberFormat(formatOptions).format(inputValue) || '';
        } catch (ignore) {
            // ignore any errors
        }
        return formattedValue;
    }

    validateType(type) {
        assert(
            type !== 'hidden',
            `<lightning-input> The type attribute value "hidden" is invalid. Use a regular <input type="hidden"> instead.`
        );
        assert(
            type !== 'submit' &&
                type !== 'reset' &&
                type !== 'image' &&
                type !== 'button',
            `<lightning-input> The type attribute value "${type}" is invalid. Use <lightning:button> instead.`
        );
        if (this.isTypeRadio) {
            assert(
                !this.required,
                `<lightning-input> The required attribute is not supported on radio inputs directly. It should be implemented at the radio group level.`
            );
        }
    }

    validateRequiredAttributes() {
        const { label } = this;
        assert(
            typeof label === 'string' && label.length,
            `<lightning-input> The required label attribute value "${label}" is invalid.`
        );
    }

    handleFileClick() {
        this.inputElement.value = null;
        this._updateValueAndValidityAttribute(null);
    }

    handleDropFiles(event) {
        // drop doesn't trigger focus nor blur, so set state to interacting
        // and auto leave when there's no more action
        this.interactingState.interacting();

        this.fileUploadedViaDroppableZone = true;
        this._files = event.dataTransfer && event.dataTransfer.files;

        this._updateProxyInputAttributes('required');

        this.dispatchChangeEventWithDetail({
            files: unwrap(this._files),
        });
    }

    // We need this handler to account for mobile platforms' soft keyboards.
    // The type of the underlying native input for type="number" needs to be changed before the focus event is triggered,
    // this way the correct soft keyboard is shown on iOS, and on Android you don't need to tap twice to get the
    // keyboard to show.
    //
    // The minor side-effect of this is that if a touch drag ends on the input, the input will change type and
    // displayed value without the focus being triggered.
    handleTouchEnd() {
        if (this._connected && this.isTypeNumber) {
            this._switchInputTypeToNumber();
        }
    }

    handleFocus() {
        this.interactingState.enter();

        if (this.isTypeColor) {
            this._isColorPickerPanelOpen = false;
        }

        if (this._connected && this.isTypeNumber) {
            this._switchInputTypeToNumber();
        }

        // W-6176985: IE11 input when set value, will move cursor to beginning.
        // This fix is only for input type=number on IE11, and force the cursor to the end.
        if (isIE11 && this.isTypeNumber) {
            const length = this.inputElement.value.length;
            this.inputElement.selectionStart = length;
            this.inputElement.selectionEnd = length;
        }

        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur(event) {
        this.interactingState.leave();

        if (this._connected && this.isTypeNumber) {
            // Don't need to change type to text and show the formatted number when value is empty.
            // This also fixes the issue where the component resets to empty string when
            // there's invalid value since input in badInput validity state gives us back an empty
            // string instead of the invalid value.
            this._showRawNumber = isEmptyString(this._value);
            if (!this._showRawNumber) {
                this.inputElement.type = 'text';
                this.inputElement.value = this.displayedValue;
            }
        }

        if (
            !event.relatedTarget ||
            !this.template.contains(event.relatedTarget)
        ) {
            this.dispatchEvent(new CustomEvent('blur'));
        }
    }

    handleChange(event) {
        event.stopPropagation();

        if (this.isTypeSimple && this.value === event.target.value) {
            return;
        }

        this.dispatchChangeEvent();
    }

    handleInput(event) {
        event.stopPropagation();

        if (this.isTypeSimple && this.value === event.target.value) {
            return;
        }

        this.dispatchChangeEvent();
    }

    handleKeyPress(event) {
        if (
            this.isTypeNumber &&
            !this.isFunctionKeyStroke(event) &&
            !this.isValidNumericKeyStroke(event)
        ) {
            event.preventDefault();
        }
    }

    dispatchChangeEvent() {
        this.interactingState.enter();

        const detail = {};

        if (this.isTypeCheckable) {
            this._updateCheckedAndValidityAttribute(this.inputElement.checked);
            detail.checked = this._checked;
        } else if (this.isTypeFile) {
            this._files = this.inputElement.files;
            // this.template.querySelector returns a proxy, and .files would also be proxied
            // we're unwrapping it here so that native apis can be used on it
            detail.files = unwrap(this._files);

            this._updateProxyInputAttributes('required');
        }

        if (!this.isTypeCheckable) {
            detail.value = this.inputElement.value;

            if (this.isTypeMobileDateTime) {
                detail.value = normalizeDateTimeToUTC(
                    detail.value,
                    this.timezone
                );
            } else if (this.isTypeMobileTime) {
                detail.value = normalizeTime(detail.value);
            }

            this._updateValueAndValidityAttribute(detail.value);
        }

        this.dispatchChangeEventWithDetail(detail);
    }

    get _showClearButton() {
        return (
            this.isTypeSearch &&
            this._value !== undefined &&
            this._value !== null &&
            this._value !== ''
        );
    }

    handleColorPickerToggleClick(event) {
        event.preventDefault();

        // Don't want error state inside panel
        if (!this.validity.valid) {
            this.inputElement.value = DEFAULT_COLOR;
            this._updateValueAndValidityAttribute(DEFAULT_COLOR);
            this._helpMessage = null;
            this.classList.remove('slds-has-error');
            this.dispatchChangeEventWithDetail({ value: DEFAULT_COLOR });
        }
    }

    handleColorChange(event) {
        const selectedColor = event.detail.color;
        if (selectedColor !== this.inputElement.value) {
            this.inputElement.value = selectedColor;
            this._updateValueAndValidityAttribute(selectedColor);
            this.focus();
            this.dispatchChangeEventWithDetail({ value: selectedColor });
        }
        this.template
            .querySelector('lightning-primitive-colorpicker-button')
            .focus();
    }

    isNonPrintableKeyStroke(keyCode) {
        return Object.keys(keyCodes).some(code => keyCodes[code] === keyCode);
    }

    isFunctionKeyStroke(event) {
        return (
            event.ctrlKey ||
            event.metaKey ||
            this.isNonPrintableKeyStroke(event.keyCode)
        );
    }

    isValidNumericKeyStroke(event) {
        return /^[0-9eE.,+-]$/.test(event.key);
    }

    isDesktopBrowser() {
        return getFormFactor() === 'DESKTOP';
    }

    normalizeDateTimeString(value) {
        let result = value;
        if (this.isTypeDate) {
            result = normalizeDate(value);
        } else if (this.isTypeTime) {
            result = normalizeTime(value);
        } else if (this.isTypeDateTime) {
            result = normalizeUTCDateTime(value, this.timezone);
        }
        return result;
    }

    get displayedValue() {
        if (this.isTypeNumber && !this._showRawNumber) {
            return this.getFormattedValue(this._value);
        }

        if (
            this.isTypeMobileDate ||
            this.isTypeMobileDateTime ||
            this.isTypeMobileTime
        ) {
            return this.normalizeDateTimeString(this._value);
        }

        return this._value;
    }

    get _internalType() {
        if (this.isTypeNumber) {
            return 'text';
        }
        return this._type;
    }

    get isStandardVariant() {
        return (
            this.variant === VARIANT.STANDARD ||
            this.variant === VARIANT.LABEL_HIDDEN
        );
    }

    _updateValueAndValidityAttribute(value) {
        this._value = value;
        this._updateProxyInputAttributes('value');
    }

    _updateCheckedAndValidityAttribute(value) {
        this._checked = value;
        this._updateProxyInputAttributes('checked');
    }

    _calculateFractionDigitsFromStep(step) {
        // clear any previous value if set
        this._calculatedFractionDigits = undefined;

        if (step && step !== 'any') {
            let numDecimals = 0;
            // calculate number of decimals using step
            const decimals = String(step).split('.')[1];
            // we're parsing the decimals to account for cases where the step is
            // '1.0'
            if (decimals && parseInt(decimals, 10) > 0) {
                numDecimals = decimals.length;
            }

            this._calculatedFractionDigits = numDecimals;
        }
    }

    get _ignoreRequired() {
        // If uploading via the drop zone or via the input directly, we should
        // ignore the required flag as a file has been uploaded
        return (
            this.isTypeFile &&
            this._required &&
            (this.fileUploadedViaDroppableZone ||
                (this._files && this._files.length > 0))
        );
    }

    _updateProxyInputAttributes(attributes) {
        if (this._constraintApiProxyInputUpdater) {
            this._constraintApiProxyInputUpdater(attributes);
        }
    }

    get _constraint() {
        if (!this._constraintApi) {
            const overrides = {
                badInput: () => {
                    if (!this._connected) {
                        return false;
                    }

                    if (
                        this.isTypeNumber &&
                        this.getFormattedValue(this._value) === 'NaN'
                    ) {
                        return true;
                    }

                    if (!this.isNativeInput) {
                        return this.inputElement.hasBadInput();
                    }

                    return this.inputElement.validity.badInput;
                },
                tooLong: () =>
                    // since type=number is type=text in the dom when not in focus
                    // we should always return false as maxlength doesn't apply
                    this.isNativeInput &&
                    !this.isTypeNumber &&
                    this._connected &&
                    this.inputElement.validity.tooLong,
                tooShort: () =>
                    // since type=number is type=text in the dom when not in focus
                    // we should always return false as minlength doesn't apply
                    this.isNativeInput &&
                    !this.isTypeNumber &&
                    this._connected &&
                    this.inputElement.validity.tooShort,
                patternMismatch: () =>
                    this.isNativeInput &&
                    this._connected &&
                    this.inputElement.validity.patternMismatch,
            };
            // FF, IE and Safari don't support type datetime-local,
            // IE and Safari don't support type date or time
            // we need to defer to the base component to check rangeOverflow/rangeUnderflow.
            // Due to the custom override, changing the type to or from datetime/time would affect the validation
            if (
                this.isTypeDesktopDateTime ||
                this.isTypeDesktopTime ||
                this.isTypeDesktopDate
            ) {
                overrides.rangeOverflow = () => {
                    // input type='time' is timezone agnostic, so we should remove the timezone designator before comparison
                    const max = this.isTypeDesktopTime
                        ? normalizeTime(this.max)
                        : this.max;

                    return isAfter(this.value, max);
                };
                overrides.rangeUnderflow = () => {
                    // input type='time' is timezone agnostic, so we should remove the timezone designator before comparison
                    const min = this.isTypeDesktopTime
                        ? normalizeTime(this.min)
                        : this.min;

                    return isBefore(this.value, min);
                };
            }

            this._constraintApi = new FieldConstraintApiWithProxyInput(() => {
                // The date/time components display their own errors and have custom messages for badInput and rangeOverflow/Underflow.
                if (!this.isNativeInput) {
                    return this.inputElement;
                }
                return this;
            }, overrides);

            this._constraintApiProxyInputUpdater = this._constraint.setInputAttributes(
                {
                    type: () => this.nativeInputType,
                    // We need to normalize value so that it's consumable by the proxy input (otherwise the value
                    // will be invalid for the native input)
                    value: () => this.normalizeDateTimeString(this.value),
                    checked: () => this.checked,
                    maxlength: () => this.maxLength,
                    minlength: () => this.minLength,
                    // 'pattern' depends on type
                    pattern: () => this.pattern,
                    // 'max' and 'min' depend on type and timezone
                    max: () => this.normalizedMax,
                    min: () => this.normalizedMin,
                    step: () => this.step,
                    accept: () => this.accept,
                    multiple: () => this.multiple,
                    disabled: () => this.disabled,
                    readonly: () => this.readOnly,
                    // depends on type and whether an upload has been made
                    required: () => this.required && !this._ignoreRequired,
                }
            );
        }
        return this._constraintApi;
    }

    _updateInputDisplayValueIfTypeNumber() {
        // Displayed value depends on the format number, so if we're not showing the raw
        // number we should update the value
        if (
            this._connected &&
            this.isTypeNumber &&
            !this._showRawNumber &&
            this.inputElement
        ) {
            this.inputElement.value = this.displayedValue;
        }
    }

    _switchInputTypeToNumber() {
        this._showRawNumber = true;
        this.inputElement.value = this.displayedValue;
        this.inputElement.inputMode = 'decimal';
        // The below check is needed due to a bug in Firefox with switching the
        // type to/from 'number'.
        // Remove the check once https://bugzilla.mozilla.org/show_bug.cgi?id=981248 is fixed
        const isFirefox = navigator.userAgent.indexOf('Firefox') >= 0;
        if (isFirefox) {
            if (this.validity.badInput) {
                // reset value manually for Firefox to emulate the behaviour of
                // a native input type number
                this.inputElement.value = '';
            }
        } else {
            this.inputElement.type = 'number';
        }
    }
}

LightningInput.interopMap = {
    exposeNativeEvent: {
        change: true,
        focus: true,
        blur: true,
    },
};

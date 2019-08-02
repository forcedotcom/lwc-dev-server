import { LightningElement, api, track, unwrap } from 'lwc';
import {
    getFieldsForLayout,
    densityValues,
    UNSUPPORTED_REFERENCE_FIELDS,
} from 'lightning/fieldUtils';
import { normalizeString } from 'lightning/utilsPrivate';
import { classSet } from 'lightning/utils';
import labelSave from '@salesforce/label/LightningRecordForm.save';
import labelCancel from '@salesforce/label/LightningRecordForm.cancel';
import labelLoading from '@salesforce/label/LightningRecordForm.loading';

const EDIT_MODE = 'edit';
const VIEW_MODE = 'view';
const READ_ONLY_MODE = 'readonly';

function isUnsupportedReferenceField(name) {
    return UNSUPPORTED_REFERENCE_FIELDS.indexOf(name) !== -1;
}

function extractLayoutFromLayouts(layouts, apiName, layout) {
    const layoutId = Object.keys(layouts[apiName])[0];
    if (
        layoutId &&
        layouts[apiName] &&
        layouts[apiName][layoutId] &&
        layouts[apiName][layoutId][layout] &&
        layouts[apiName][layoutId][layout].View
    ) {
        return layouts[apiName][layoutId][layout].View;
    }
    return null;
}

/**
 * Creates an editable form or display form for a record.
 */
export default class LightningRecordForm extends LightningElement {
    @track readOnly = false;
    @track _recordId;
    @track _objectApiName;
    @track _fields = [];
    @track _editMode = false;
    @track cols = 1;
    @track _loading = true;
    @track fieldsReady = false;

    /**
     * The ID of the record type, which is required if you created
     * multiple record types but don't have a default.
     * @type {string}
     */
    @api recordTypeId;
    _firstLoad = true;
    _loadError = false;
    _layout;
    _dupMapper = {};
    _mode;
    _labelSave = labelSave;
    _labelCancel = labelCancel;
    _labelLoading = labelLoading;
    _loadedPending = false;
    _rawFields;
    @track _density = densityValues.AUTO;

    set mode(val) {
        val = val.toLowerCase(); // just to make it easier for customers
        this._mode = val;
        switch (val) {
            case EDIT_MODE:
                this.readOnly = false;
                this._editMode = true;
                break;
            case VIEW_MODE:
                this.readOnly = false;
                this._editMode = false;
                break;
            case READ_ONLY_MODE:
                this.readOnly = true;
                this._editMode = false;
                break;
            default:
                this.readOnly = false;
                if (!this._recordId) {
                    this._editMode = true;
                } else {
                    this._editMode = false;
                }
        }
    }

    /**
     * Specifies the interaction and display style for the form.
     * Possible values: view, edit, readonly.
     * If a record ID is not provided, the default mode is edit, which displays a form to create new records.
     * If a record ID is provided, the default mode is view, which displays field values with edit icons on updateable fields.
     * @type {string}
     */
    @api
    get mode() {
        return this._mode;
    }

    set layoutType(val) {
        if (val.match(/Full|Compact/)) {
            this._layout = val;
        } else {
            throw new Error(
                `Invalid layout "${val}". Layout must be "Full" or "Compact"`
            );
        }
    }

    /**
     * The type of layout to use to display the form fields. Possible values: Compact, Full.
     * When creating a new record, only the full layout is supported.
     * @type {string}
     */
    @api
    get layoutType() {
        return this._layout;
    }

    /**
     * Sets the arrangement style of fields and labels in the form.
     * Accepted values are compact, comfy, and auto (default).
     * Use compact to display fields and their labels on the same line.
     * Use comfy to display fields below their labels.
     * Use auto to let the component dynamically set
     * the density according to the user's Display Density setting
     * and the width of the form.
     * @type {string}
     */
    @api
    get density() {
        return this._density;
    }

    set density(val) {
        this._density = normalizeString(val, {
            fallbackValue: densityValues.AUTO,
            validValues: [
                densityValues.AUTO,
                densityValues.COMPACT,
                densityValues.COMFY,
            ],
        });
    }

    set recordId(val) {
        if (!val && !this._mode) {
            this._editMode = true;
        }

        this._recordId = val;
    }

    /**
     * The ID of the record to be displayed.
     * @type {string}
     *
     */
    @api
    get recordId() {
        return this._recordId;
    }

    set objectApiName(val) {
        this._objectApiName = val;
    }

    /**
     * The API name of the object.
     * @type {string}
     * @required
     */
    @api
    get objectApiName() {
        return this._objectApiName;
    }

    set columns(val) {
        // cols must always be a positive integer
        this.cols = parseInt(val, 10);
        if (isNaN(this.cols) || this.cols < 1) {
            this.cols = 1;
        }
    }

    /**
     * Specifies the number of columns for the form.
     * @type {number}
     */
    @api
    get columns() {
        return this.cols;
    }

    /**
     * Submits the form using an array of record fields or field IDs.
     * The field ID is provisioned from @salesforce/schema/.
     * Invoke this method only after the load event.
     * @param {string[]|FieldId[]} fields - Array of record field names or field IDs.
     */
    @api
    submit(fields) {
        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);
    }

    // fast de-dupe because Set polyfill is not great
    addField(val) {
        // duck type reference objects
        const fieldName = val.fieldApiName ? val.fieldApiName : val;
        if (!this._dupMapper[fieldName]) {
            this._fields.push(fieldName);
            this._dupMapper[fieldName] = true;
        }
    }
    /*
     * Retrieves a layout from the cache. If it doesn't exist in the cache it will retrieve it from the server and put it into the cache.
     * @param objectApiName: string - The object api name of the layout to retrieve.
     * @param layoutType: string - The layout type of the layout to retrieve.
     * @param mode: string - The mode of the layout to retrieve.
     * @param recordTypeId: string - The record type id of the layout to retrieve.
     * @returns {Object} The observable used to get the value and keep watch on it for changes.
     */
    connectedCallback() {
        if (!this._recordId && !this._mode) {
            this._editMode = true;
        }
    }

    set fields(val) {
        this.fieldsReady = true;
        if (Array.isArray(val)) {
            for (let i = 0; i < val.length; i++) {
                this.addField(val[i]);
            }
        } else {
            this.addField(val);
        }
    }

    /**
     * List of fields to be displayed. The fields display in the order you list them.
     * @type {string[]}
     */
    @api
    get fields() {
        return this._rawFields;
    }

    get _editable() {
        return !this._loading && !this.readOnly && !this._loadError;
    }

    get _viewMode() {
        return !this._editMode;
    }

    set _viewMode(val) {
        this._editMode = !val;
    }

    get _rows() {
        const out = [];
        const rowLength = this.cols;
        const fields = this._fields.slice();
        let rowkey = 0;
        let thisRow = { fields: [], key: rowkey };
        while (fields.length > 0) {
            if (thisRow.fields.length < rowLength) {
                const field = fields.shift();
                thisRow.fields.push({
                    field,
                    editable:
                        !isUnsupportedReferenceField(field) &&
                        this._editable &&
                        (this._objectInfo && this._objectInfo.fields[field]
                            ? this._objectInfo.fields[field].updateable
                            : false),
                });
            } else {
                out.push(thisRow);
                thisRow = { fields: [], key: ++rowkey };
            }
        }
        if (thisRow.fields.length) {
            out.push(thisRow);
        }
        return out;
    }

    get computedInputClass() {
        if (this.cols === 1) {
            return 'slds-form-element_1-col';
        }
        return '';
    }

    get computedOutputClass() {
        const classnames = classSet(
            'slds-form-element_small slds-form-element_edit slds-hint-parent'
        );

        return classnames
            .add({
                'slds-form-element_1-col': this.cols === 1,
            })
            .toString();
    }

    toggleEdit(e) {
        if (e) {
            e.stopPropagation();
        }
        this._editMode = !this._editMode;
    }

    handleLoad(e) {
        e.stopPropagation();
        let fields;
        const apiName = this._objectApiName.objectApiName
            ? this._objectApiName.objectApiName
            : this._objectApiName;
        if (this._layout && e.detail.objectInfos) {
            if (e.detail.layout) {
                fields = getFieldsForLayout(
                    e.detail.layout,
                    e.detail.objectInfos[apiName]
                );
            } else if (e.detail.layouts) {
                const layout = extractLayoutFromLayouts(
                    e.detail.layouts,
                    apiName,
                    this._layout
                );
                if (layout) {
                    fields = getFieldsForLayout(
                        layout,
                        e.detail.objectInfos[apiName]
                    );
                }
            }
        }

        if (fields) {
            // Fields is populated from event data (e.detail.objectInfos), which is wrapped inside
            // of a shadow dom membrane. In order to set fields into
            // this.fields, which is a reactive membrane, fields has to first
            // be unwrapped to avoid issues of discontinuity
            this.fields = unwrap(fields);
        }

        if (this._firstLoad) {
            this._loading = false;
            this._firstLoad = false;
        }

        // This timeout is so that the edit buttons
        // don't appear before the fields,
        // this tails the render if loading until later
        if (this._loadedPending) {
            // eslint-disable-next-line lwc/no-set-timeout
            setTimeout(() => {
                this._loading = false;
                this._loadedPending = false;
            }, 0);
        }
        this._objectInfo = unwrap(e.detail.objectInfos[this._objectApiName]);

        this.dispatchEvent(
            new CustomEvent('load', {
                detail: e.detail,
            })
        );
    }

    handleError(e) {
        e.stopPropagation();
        this._loading = false;
        if (this._firstLoad) {
            this._loadError = true;
        }
        this.dispatchEvent(
            new CustomEvent('error', {
                detail: e.detail,
            })
        );
    }

    handleSubmit(e) {
        // eslint-disable-next-line lwc/no-set-timeout
        setTimeout(() => {
            // The user may have canceled the submit.
            // For example to do some validation prior to submitting the form. See W-5472812
            this._loading = !e.defaultPrevented;
        }, 0);
    }

    clearForm() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    handleCancel(e) {
        if (this._recordId) {
            this.toggleEdit(e);
        } else {
            this.clearForm();
        }

        this.dispatchEvent(new CustomEvent('cancel'));
    }

    handleSuccess(e) {
        e.stopPropagation();
        this._loadedPending = true;
        this._editMode = false;
        this.recordId = e.detail.id;
        this.dispatchEvent(
            new CustomEvent('success', {
                detail: e.detail,
            })
        );
    }
}

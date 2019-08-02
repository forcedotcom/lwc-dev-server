// TODO: Rename labels to something more generic
import labelApiNameMismatch from '@salesforce/label/LightningRecordEditForm.apiNameMismatch';
import labelInvalidId from '@salesforce/label/LightningRecordEditForm.invalidID';
import { LightningElement, api, track, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';

import {
    getFieldSet,
    createErrorEvent,
    densityValues,
    labelAlignValues,
} from 'lightning/fieldUtils';
import { normalizeRecordId } from 'lightning/recordUtils';
import {
    doNormalization,
    resetResizeObserver,
    setLabelAlignment,
} from 'lightning/formDensityUtilsPrivate';

/**
 * Represents a record view layout that displays one or more fields, provided by lightning-output-field.
 * @slot default Placeholder for lightning-output-field.
 */
export default class LightningRecordView extends LightningElement {
    optionalFields = [];
    fieldSet;

    _recordId;
    _wiredRecordId;
    _objectApiName;
    _recordUi;

    _density = densityValues.AUTO;
    _fieldLabelAlignment = labelAlignValues.HORIZONTAL;
    _initialRender = true;

    @track recordUi;

    constructor() {
        super();
        this.fieldSet = getFieldSet(this.objectApiName || '');
        this._formLayoutInterface = this.formLayoutInterface();
    }

    connectedCallback() {
        if (!this.recordId) {
            this.displayWarning(
                'record id is required but is currently undefined or null'
            );
        }

        if (!this.objectApiName) {
            this.displayWarning(
                'API name is required but is currently undefined or null'
            );
        }
    }

    renderedCallback() {
        this.handleRegister();
        if (this._initialRender) {
            setLabelAlignment(this._formLayoutInterface);
            resetResizeObserver(this, this._formLayoutInterface);
        }
        this._initialRender = false;
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
        doNormalization(val, this._formLayoutInterface);
        if (!this._initialRender) {
            resetResizeObserver(this, this._formLayoutInterface);
        }
    }

    set recordId(value) {
        if (!value) {
            this.displayWarning(
                'record id is required but is currently undefined or null'
            );
            this._recordId = value;
            this._wiredRecordId = this._recordId;
            this.wireViewData(null);
            return;
        }

        this._recordId = normalizeRecordId(value);
        if (!this._recordId) {
            const error = { message: labelInvalidId };
            this.handleError(error);

            return;
        }

        if (this.objectApiName) {
            this._wiredRecordId = [this._recordId];
        }
    }

    /**
     * The ID of the record to be displayed.
     * @type {string}
     * @required
     */
    @api
    get recordId() {
        return this._recordId;
    }

    set objectApiName(value) {
        // duck typing for string vs object
        let apiName;
        if (value && value.objectApiName) {
            apiName = value.objectApiName;
        } else {
            apiName = value;
        }
        this._objectApiName = apiName;

        if (!apiName) {
            this.displayWarning(
                'API Name is required but is currently undefined or null'
            );
            return;
        }

        // Update fieldset and wires
        this.fieldSet.objectApiName = apiName || '';
        this.handlePersonAccounts();

        this.optionalFields = this.fieldSet.getList();
        if (this.recordId) {
            this._wiredRecordId = [this.recordId];
        }
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

    @wire(getRecordUi, {
        recordIds: '$_wiredRecordId',
        layoutTypes: ['Full'],
        modes: ['View'],
        optionalFields: '$optionalFields',
    })
    wiredRecordUi(value) {
        this.handleData(value);
    }

    handleData({ error, data }) {
        if (error) {
            this.handleError(error);
            return;
        } else if (!data || !this.recordId) {
            return;
        }

        const record = data.records[this.recordId];
        if (record.apiName !== this.objectApiName) {
            const message = labelApiNameMismatch
                .replace('{0}', this.objectApiName)
                .replace('{1}', record.apiName);
            this.handleError({ message });
            return;
        }
        const viewData = {
            record,
            objectInfo: data.objectInfos[record.apiName],
            labelAlignment: this._fieldLabelAlignment,
        };

        this.wireViewData(viewData);
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: data,
            })
        );
    }

    handleError(error) {
        this.dispatchEvent(createErrorEvent(error));
    }

    handleRegister() {
        this.fieldSet.concat(this.getFields());

        // optional fields list is only valid if we have an objectApiName
        if (this.objectApiName) {
            this.handlePersonAccounts();
            this.optionalFields = this.fieldSet.getList();
        }
    }

    handlePersonAccounts() {
        if (
            this.objectApiName === 'Account' ||
            this.objectApiName === 'PersonAccount'
        ) {
            this.fieldSet.add('IsPersonAccount');
        }
    }

    getFields() {
        const fields = this.getOutputFieldComponents();

        return Array.prototype.map.call(fields, field => {
            return field.fieldName;
        });
    }

    getOutputFieldComponents() {
        return this.querySelectorAll('lightning-output-field');
    }

    displayWarning(message) {
        // eslint-disable-next-line no-console
        console.warn(message);
    }

    wireViewData(viewData) {
        this._recordUi = viewData;
        this.getOutputFieldComponents().forEach(outputField => {
            outputField.wireRecordUi(viewData);
        });
    }

    formLayoutInterface() {
        const that = this;
        return {
            getDensityPrivate() {
                return that._density;
            },
            setDensityPrivate(value) {
                that._density = value;
            },
            getDensity() {
                return that.density;
            },
            getLabelAlignmentPrivate() {
                return that._fieldLabelAlignment;
            },
            getContainerElement() {
                return that.template.querySelector('div');
            },
            getInputOutputFields() {
                return that.getOutputFieldComponents();
            },
            setLabelAlignmentPrivate(value) {
                that._fieldLabelAlignment = value;
            },
            getRecordUi() {
                return that._recordUi;
            },
            getResizeObserverCallback(callback) {
                return () => {
                    callback(that._formLayoutInterface);
                };
            },
        };
    }
}

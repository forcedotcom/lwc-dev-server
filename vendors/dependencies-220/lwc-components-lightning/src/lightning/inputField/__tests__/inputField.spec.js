import { createElement } from 'lwc';
import Element from 'lightning/inputField';
import store from './mockData.json';
import picklistStore from './mockPicklistData.json';

const FAKE_OBJECT_INFOS = { isObjectInfos: true };
function createInputField(
    fieldName,
    nullify = false,
    value = undefined,
    params = {},
    updateable = true,
    events,
    creatable = true,
    createMode = false,
    labelAlignment
) {
    const element = createElement('lightning-input-field', { is: Element });
    // safe deep clone
    const data = JSON.parse(JSON.stringify(store));
    element.fieldName = fieldName;

    if (value !== undefined) {
        element.value = value;
    }
    if (nullify) {
        data.record.fields[fieldName].value = null;
        if (fieldName === 'LookupId') {
            delete data.record.fields.Lookup;
        }
    }

    data.objectInfos = FAKE_OBJECT_INFOS;
    data.createMode = createMode;
    data.labelAlignment = labelAlignment;
    Object.assign(element, params);

    if (events) {
        Object.keys(events).forEach(eventName => {
            element.addEventListener(eventName, events[eventName]);
        });
    }

    if (!updateable) {
        data.objectInfo.fields[fieldName].updateable = false;
        Object.keys(data.objectInfo.fields).forEach(field => {
            if (data.objectInfo.fields[field].compoundFieldName === fieldName) {
                data.objectInfo.fields[field].updateable = false;
            }
        });
    }

    if (!creatable) {
        data.objectInfo.fields[fieldName].creatable = false;
        Object.keys(data.objectInfo.fields).forEach(field => {
            if (data.objectInfo.fields[field].compoundFieldName === fieldName) {
                data.objectInfo.fields[field].creatable = false;
            }
        });
    }
    document.body.appendChild(element);
    element.wireRecordUi(data);
    if (isPicklist(fieldName) || hasPicklist(fieldName)) {
        element.wirePicklistValues(JSON.parse(JSON.stringify(picklistStore)));
    }
    return element;
}

// NOTE: the "type" in this object is the _input type_ not the
// record data type
const fields = {
    Text: {
        name: 'Text',
        value: 'Some Plain Text',
        label: 'Plain Text',
        fieldLevelHelp: 'Some help text',
    },
    Phone: {
        name: 'Phone',
        value: '403-203-1048',
        label: 'Phone Number',
        fieldLevelHelp: 'Some help text',
    },
    Email: {
        name: 'Email',
        type: 'email',
        label: 'Email',
        value: 'the@email.something',
        fieldLevelHelp: 'Some help text',
    },
    RequiredNumber: {
        name: 'RequiredNumber',
        type: 'number',
        required: true,
        step: 1,
        label: 'Required Number',
        value: 10,
        formatter: 'decimal',
    },
    DoubleNumber: {
        name: 'DoubleNumber',
        type: 'number',
        required: true,
        step: 0.0001,
        label: 'Double Number',
        value: 10.2233,
        formatter: 'decimal',
    },
    DecimalNumber: {
        name: 'DecimalNumber',
        type: 'number',
        required: true,
        step: 0.0001,
        label: 'Decimal Number',
        value: 10.2233,
        formatter: 'decimal',
    },
    RichText: {
        value: '<b>rich text</b>',
        required: true,
        label: 'Rich Text',
        fieldLevelHelp: 'Some help text',
    },
    LookupId: {
        value: ['005R0000000F9tkIAC'],
        record: JSON.parse(JSON.stringify(store)).record,
        objectInfos: FAKE_OBJECT_INFOS,
        label: 'Lookup',
        fieldName: 'LookupId',
    },
    Currency: {
        name: 'Currency',
        type: 'number',
        step: 0.01,
        label: 'Currency',
        value: 10.05,
        formatter: 'currency',
        fieldLevelHelp: 'Some help text',
    },
    TextArea: {
        name: 'TextArea',
        value: 'Hello how are you',
        label: 'Plain text',
    },
    Url: {
        name: 'Url',
        label: 'url',
        value: 'www.google.com',
        fieldLevelHelp: 'Some help text',
    },
    Boolean: {
        name: 'Boolean',
        checked: true,
        label: 'Checkbox label',
        type: 'checkbox',
        fieldLevelHelp: 'Some help text',
    },
    Date: {
        name: 'Date',
        type: 'date',
        label: 'date',
        value: '1902-02-02',
        fieldLevelHelp: 'Some help text',
    },
    /* fake lookups render as text */
    OwnerId: {
        name: 'OwnerId',
        type: 'text',
        disabled: true,
        required: true,
        label: 'Owner ID',
        value: 'Test User',
    },
    CreatedById: {
        name: 'CreatedById',
        type: 'text',
        disabled: true,
        required: true,
        label: 'Created By ID',
        value: 'Test User',
    },
    LastModifiedById: {
        name: 'LastModifiedById',
        type: 'text',
        disabled: true,
        required: true,
        label: 'Last Modified By ID',
        value: 'Test User',
    },
    DateTime: {
        name: 'DateTime',
        type: 'datetime',
        label: 'date time',
        value: '2017-08-31T21:11:00.000Z',
        fieldLevelHelp: 'Some help text',
    },
    Percent: {
        fieldLevelHelp: null,
        label: 'Percent',
        name: 'Percent',
        required: false,
        type: 'number',
        step: 1,
        value: 100,
        formatter: 'percent-fixed',
    },
    PercentScale: {
        fieldLevelHelp: null,
        label: 'Percent',
        name: 'PercentScale',
        required: false,
        type: 'number',
        step: 0.01,
        value: 90.02,
        formatter: 'percent-fixed',
    },
    NameSimple: {
        name: 'NameSimple',
        value: 'Simple Name',
        label: 'Simple Name',
    },
    ReadOnly: {
        name: 'ReadOnly',
        value: 'read only stuff',
        disabled: true,
        label: 'Plain text',
        fieldLevelHelp: 'Some help text',
    },
    Picklist: {
        fieldLevelHelp: 'Some help text',
        label: 'Single Select Picklist',
        name: 'Picklist',
        options: [
            {
                label: 'New York',
                validFor: [],
                value: 'New York',
            },
            {
                label: 'California',
                validFor: [],
                value: 'California',
            },
            {
                label: 'Ontario',
                validFor: [],
                value: 'Ontario',
            },
            {
                label: 'British Columbia',
                validFor: [],
                value: 'British Columbia',
            },
        ],
        value: 'California',
    },
    MultiPicklist: {
        fieldLevelHelp: 'Some help text',
        label: 'Multi Select Picklist',
        multiple: true,
        name: 'MultiPicklist',
        options: [
            {
                label: 'New York',
                validFor: [0],
                value: 'New York',
            },
            {
                label: 'California',
                validFor: [0],
                value: 'California',
            },
            {
                label: 'Ontario',
                validFor: [1],
                value: 'Ontario',
            },
            {
                label: 'British Columbia',
                validFor: [1],
                value: 'British Columbia',
            },
        ],
        value: 'California;New York',
    },
};

function isPicklist(fieldName) {
    return [
        'Picklist',
        'MultiPicklist',
        'DependentPicklist',
        'ControllingPicklist',
        'DependentPicklistNoController',
    ].includes(fieldName);
}

function hasPicklist(fieldName) {
    return ['Name', 'Address', 'ShippingAddress'].includes(fieldName);
}

describe('Types', () => {
    generateTestForAllTypes('Works with', async (element, fieldName) => {
        const attributes = element.shadowRoot
            .querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup,lightning-input-location'
            )
            .getAttributes();
        expect(attributes).toEqual(fields[fieldName]);

        if (isPicklist(fieldName)) {
            // This is only an array of values that should exist in the options, not what is passed into the picklist
            expect(attributes.options).toContainOptions([
                'New York',
                'California',
                'British Columbia',
            ]);
        }
    });
});

describe('Reset', () => {
    generateTestForAllTypes(
        'returns value to initial state for',
        (element, fieldName) => {
            element.value = 'banana';
            return new Promise((resolve, r) => {
                if (fieldName.match(/(Boolean|Id)$/)) {
                    // skip lookups and booleans (handled separately)
                    resolve();
                }
                Promise.resolve().then(() => {
                    element.reset();
                    // eslint-disable-next-line lwc/no-set-timeout
                    setTimeout(() => {
                        try {
                            expect(element.value).toEqual(
                                fields[fieldName].value
                            );
                        } catch (e) {
                            r(e);
                        }
                        resolve();
                    }, 1);
                });
            });
        }
    );

    it('returns value to intial state for Booleans', () => {
        const element = createInputField('Boolean');
        element.value = false;
        return new Promise((resolve, r) => {
            element.reset();
            // eslint-disable-next-line lwc/no-set-timeout
            setTimeout(() => {
                try {
                    expect(element.value).toEqual(true);
                } catch (e) {
                    r(e);
                }
                resolve();
            }, 1);
        });
    });
});

describe('Null value', () => {
    generateTestForAllTypes(
        'renders input with a null value',
        async element => {
            expect(element).toMatchSnapshot();
        },
        true
    );
});

describe('Disabled attribute', () => {
    it('disables the field if set', () => {
        const element = createInputField('Boolean');
        element.disabled = true;
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes.disabled).toEqual(true);
        });
    });

    it('has a getter that returns true for read only fields', () => {
        const element = createInputField('ReadOnly');
        return Promise.resolve().then(() => {
            expect(element.disabled).toEqual(true);
        });
    });

    it('has a getter that returns false for other fields', () => {
        const element = createInputField('Boolean');
        return Promise.resolve().then(() => {
            expect(element.disabled).toEqual(false);
        });
    });
});

describe('object fieldName reference', () => {
    it('displays properly', () => {
        const element = createElement('lightning-input-field', { is: Element });
        const data = JSON.parse(JSON.stringify(store));
        element.fieldName = { fieldApiName: 'Text', objectApiName: 'entity' };
        document.body.appendChild(element);
        element.wireRecordUi(data);
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes).toEqual(fields.Text);
        });
    });

    it('throws an error on objectApiName mismatch', () => {
        const element = createElement('lightning-input-field', { is: Element });
        const data = JSON.parse(JSON.stringify(store));
        element.fieldName = {
            fieldApiName: 'Text',
            objectApiName: 'notEntity',
        };
        document.body.appendChild(element);
        expect(() => {
            element.wireRecordUi(data);
        }).toThrowErrorMatchingSnapshot();
    });
    it('should not throw when "fieldName" is set to "undefined"', () => {
        const element = createElement('lightning-input-field', { is: Element });
        const data = JSON.parse(JSON.stringify(store));
        document.body.appendChild(element);

        expect(() => {
            element.fieldName = undefined;
            element.wireRecordUi(data);
        }).not.toThrowError();
    });
});

describe('Readonly attribute', () => {
    it('returns true for readonly fields', () => {
        const element = createInputField('ReadOnly');
        return Promise.resolve().then(() => {
            expect(element.readonly).toEqual(true);
        });
    });

    it('returns false for updateable fields', () => {
        const element = createInputField('Boolean');
        return Promise.resolve().then(() => {
            expect(element.readonly).toEqual(false);
        });
    });

    it('returns false for fields that are creatable in create mode', () => {
        const element = createInputField(
            'Createable',
            false,
            null,
            {},
            false,
            null,
            true,
            true
        );
        return Promise.resolve().then(() => {
            expect(element.readonly).toEqual(false);
        });
    });

    it('returns true for fields that are not creatable in create mode', () => {
        const element = createInputField(
            'NotCreateable',
            false,
            null,
            {},
            false,
            null,
            true,
            true
        );
        return Promise.resolve().then(() => {
            expect(element.readonly).toEqual(true);
        });
    });
});

describe('Checkbox', () => {
    it('loads checked if true', () => {
        const element = createInputField('Boolean');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes.checked).toEqual(true);
        });
    });

    it('loads unchecked if false', () => {
        const element = createInputField('FalseBoolean');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes.checked).toBeFalsy();
        });
    });

    it('returns a false value if unchecked', done => {
        testFieldAfterClick('Boolean', element => {
            expect(element.value).toEqual(false);
            done();
        });
    });

    it('returns a true value if checked', done => {
        testFieldAfterClick('FalseBoolean', element => {
            expect(element.value).toEqual(true);
            done();
        });
    });
});

describe('Report validity', () => {
    generateTestForAllTypes(
        'calls report validity on child input component',
        async element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup,lightning-input-location'
            );
            expect(element.reportValidity()).toEqual(true);
            expect(input.reportValidity()).toEqual(true);
        }
    );
});

describe('Reactive  value', () => {
    it('displays the provided value when set, not the record value', () => {
        const element = createInputField('Text', false, 'banana');
        expect(element.value).toEqual('banana');
    });

    it('passes the correct value through to the input', () => {
        const element = createInputField('Text', false, 'banana');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes.value).toEqual('banana');
        });
    });

    it('passes the correct value through to the checkbox', () => {
        const element = createInputField('Boolean', false, false);
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes.checked).toEqual(false);
        });
    });

    it('sets the checkbox to unchecked when value is false', () => {
        const element = createInputField('Boolean', false, false);
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
});

describe('lookup', () => {
    it('updates dirty values on change', () => {
        const element = createInputField('LookupId');
        return Promise.resolve().then(() => {
            const lookup = element.shadowRoot.querySelector('lightning-lookup');

            lookup.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        value: ['newvalue'],
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual('newvalue');
        });
    });

    it('sets the value to an empty string when unset', () => {
        const element = createInputField('LookupId');
        return Promise.resolve().then(() => {
            const lookup = element.shadowRoot.querySelector('lightning-lookup');

            lookup.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        value: [],
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual('');
        });
    });
});

describe('geoloc', () => {
    it('renders an input location', () => {
        const element = createInputField('Geo__c');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input-location')
                .getAttributes();
            expect(attributes).toEqual({
                label: 'Geo',
                latitude: 37.794016,
                longitude: -122.395016,
                required: false,
            });
        });
    });

    it('returns a value that is a map of values', () => {
        const element = createInputField('Geo__c');
        return Promise.resolve().then(() => {
            const value = element.value;
            expect(value).toEqual({
                latitude: 37.794016,
                longitude: -122.395016,
            });
        });
    });

    it('updates dirty values on change', () => {
        const element = createInputField('Geo__c');
        return Promise.resolve().then(() => {
            const geo = element.shadowRoot.querySelector(
                'lightning-input-location'
            );

            geo.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        longitude: 42,
                        latitude: 43,
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual({
                longitude: 42,
                latitude: 43,
            });
        });
    });
});

describe('name', () => {
    it('renders an input name', () => {
        const element = createInputField('Name');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input-name')
                .getAttributes();
            expect(attributes).toEqual({
                firstName: 'Jim',
                lastName: 'Steele',
                salutation: null,
                label: 'Full Name',
            });
        });
    });

    it('returns a value that is a map of values', () => {
        const element = createInputField('Name');
        return Promise.resolve().then(() => {
            const value = element.value;
            expect(value).toEqual({
                FirstName: 'Jim',
                LastName: 'Steele',
                Salutation: null,
            });
        });
    });

    it('updates dirty values on change', () => {
        const element = createInputField('Name');
        return Promise.resolve().then(() => {
            const name = element.shadowRoot.querySelector(
                'lightning-input-name'
            );

            name.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        firstName: 'Bob',
                        lastName: 'Smith',
                        salutation: 'Mr.',
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual({
                FirstName: 'Bob',
                LastName: 'Smith',
                Salutation: 'Mr.',
            });
        });
    });

    it('renders simple names (like account name) as a text field', () => {
        const element = createInputField('NameSimple');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input')
                .getAttributes();
            expect(attributes).toEqual(fields.NameSimple);
        });
    });

    it('is disabled if no constituent field is updateable', () => {
        const element = createInputField('Name', false, undefined, {}, false);
        return Promise.resolve().then(() => {
            const name = element.shadowRoot.querySelector(
                'lightning-input-name'
            );
            expect(name.getAttributes().disabled).toBe(true);
        });
    });
});

describe('address', () => {
    it('renders an input address', () => {
        const element = createInputField('Address');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-input-address')
                .getAttributes();
            expect(attributes).toEqual({
                country: 'US',
                province: 'AK',
                postalCode: '6156',
                postalCodeLabel: 'Zip/Postal Code',
                city: 'Hartford',
                street: '11 Farm Avenue',
                streetLabel: 'Street',
                provinceLabel: 'State/Province Code',
                countryLabel: 'Country Code',
                cityLabel: 'City',
            });
        });
    });

    it('returns a value that is a map of values', () => {
        const element = createInputField('Address');
        return Promise.resolve().then(() => {
            const value = element.value;
            expect(value).toEqual({
                CountryCode: 'US',
                StateCode: 'AK',
                PostalCode: '6156',
                City: 'Hartford',
                Street: '11 Farm Avenue',
            });
        });
    });

    it('updates dirty values on change', () => {
        const element = createInputField('Address');
        return Promise.resolve().then(() => {
            const name = element.shadowRoot.querySelector(
                'lightning-input-address'
            );

            name.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    // detail always includes the full set of data
                    detail: {
                        country: 'ZZ',
                        city: 'Bananaville',
                        street: '123 Fake St',
                        province: 'AK',
                        postalCode: '6156',
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual({
                CountryCode: 'ZZ',
                City: 'Bananaville',
                Street: '123 Fake St',
                StateCode: 'AK',
                PostalCode: '6156',
            });
        });
    });

    it('renders null values correctly for normal country/state', () => {
        const element = createInputField('BillingAddress');
        return Promise.resolve().then(() => {
            const value = element.value;
            expect(value).toEqual({
                BillingCity: null,
                BillingCountry: null,
                BillingPostalCode: null,
                BillingState: null,
                BillingStreet: null,
            });
        });
    });

    it('renders null values correctly for picklist country/state', () => {
        const element = createInputField('ShippingAddress');
        return Promise.resolve().then(() => {
            const value = element.value;
            expect(value).toEqual({
                ShippingCity: null,
                ShippingCountryCode: 'US', // default value
                ShippingPostalCode: null,
                ShippingStateCode: null,
                ShippingStreet: null,
            });
        });
    });

    it('updates values correctly for billingAddress (non picklist)', () => {
        const element = createInputField('BillingAddress');

        return Promise.resolve().then(() => {
            const input = element.shadowRoot.querySelector(
                'lightning-input-address'
            );

            input.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    // detail always includes the full set of data
                    detail: {
                        country: 'ZZ',
                        city: 'Bananaville',
                        street: '123 Fake St',
                        province: 'AK',
                        postalCode: '6156',
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual({
                BillingCity: 'Bananaville',
                BillingCountry: 'ZZ',
                BillingPostalCode: '6156',
                BillingState: 'AK',
                BillingStreet: '123 Fake St',
            });
        });
    });

    it('updates values correctly for shippingAddress with picklists', () => {
        const element = createInputField('ShippingAddress');

        return Promise.resolve().then(() => {
            const input = element.shadowRoot.querySelector(
                'lightning-input-address'
            );

            input.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    // detail always includes the full set of data
                    detail: {
                        country: 'ZZ',
                        city: 'Bananaville',
                        street: '123 Fake St',
                        province: 'AK',
                        postalCode: '6156',
                    },
                })
            );

            const value = element.value;
            expect(value).toEqual({
                ShippingCity: 'Bananaville',
                ShippingCountryCode: 'ZZ',
                ShippingPostalCode: '6156',
                ShippingStateCode: 'AK',
                ShippingStreet: '123 Fake St',
            });
        });
    });

    it('is disabled if no constituent field is updateable', () => {
        const element = createInputField(
            'Address',
            false,
            undefined,
            {},
            false
        );
        return Promise.resolve().then(() => {
            const address = element.shadowRoot.querySelector(
                'lightning-input-address'
            );
            expect(address.getAttributes().disabled).toBe(true);
        });
    });
});

describe('picklist', () => {
    it('passes the correct value through to the picklist', () => {
        const element = createInputField('Picklist', false, 'Ontario');
        return Promise.resolve().then(() => {
            const attributes = element.shadowRoot
                .querySelector('lightning-picklist')
                .getAttributes();
            expect(attributes.value).toEqual('Ontario');
        });
    });

    it('registers itself when in a dependency chain', () => {
        const registerFunc = jest.fn();
        createInputField('DependentPicklist', false, '', {}, true, {
            registerfielddependency: registerFunc,
        });
        expect(registerFunc).toBeCalled();
    });

    it('does not register itself when not in a dependency chain', () => {
        const registerFunc = jest.fn();
        createInputField('Picklist', false, '', {}, true, {
            registerfielddependency: registerFunc,
        });
        expect(registerFunc).not.toBeCalled();
    });

    it('throws error when controller field is missing', () => {
        expect(() => {
            createInputField('DependentPicklistNoController', false, '');
        }).toThrow();
    });

    it('multiple=true does not register itself when not in a dependency chain', () => {
        const registerFunc = jest.fn();
        createInputField('MultiPicklist', false, '', {
            onregisterfielddependency: registerFunc,
        });
        expect(registerFunc).not.toBeCalled();
    });

    it('notifies dependency manager to update dependents', () => {
        const updateFunc = jest.fn();
        const element = createInputField(
            'ControllingPicklist',
            false,
            '',
            {},
            true,
            {
                updatedependentfields: updateFunc,
            }
        );
        return Promise.resolve().then(() => {
            element.value = 'Canada';
            const picklist = element.shadowRoot.querySelector(
                'lightning-picklist'
            );

            picklist.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        name: 'detail',
                        value: 'Canada',
                    },
                })
            );

            expect(updateFunc).toBeCalled();
        });
    });
});

describe('alignment of labels', () => {
    generateTestForAllTypes(
        'passes correct variant to inputs for the given label alignment',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-stacked');
        },
        false,
        undefined,
        {},
        true,
        undefined,
        true,
        false,
        'stacked'
    );
    generateTestForAllTypes(
        'passes correct variant to inputs when label alignment is changed',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-stacked');
            const data = JSON.parse(JSON.stringify(store));
            data.labelAlignment = 'horizontal';
            element.wireRecordUi(data);
            return Promise.resolve().then(() => {
                expect(input.variant).toEqual('label-inline');
            });
        },
        false,
        undefined,
        {},
        true,
        undefined,
        true,
        false,
        'stacked'
    );
    generateTestForAllTypes(
        'variant takes precedence over label-alignment from densification',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-hidden');
            const data = JSON.parse(JSON.stringify(store));
            data.labelAlignment = 'horizontal';
            element.wireRecordUi(data);
            return Promise.resolve().then(() => {
                expect(input.variant).toEqual('label-hidden');
            });
        },
        false,
        undefined,
        { variant: 'label-hidden' },
        true,
        undefined,
        true,
        false,
        'stacked'
    );
    generateTestForAllTypes(
        'variant is reactive',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-stacked');
            const data = JSON.parse(JSON.stringify(store));
            data.labelAlignment = 'horizontal';
            element.wireRecordUi(data);
            element.variant = 'label-hidden';
            return Promise.resolve().then(() => {
                expect(input.variant).toEqual('label-hidden');
            });
        },
        false,
        undefined,
        { variant: 'label-stacked' },
        true,
        undefined,
        true,
        false,
        'stacked'
    );
    generateTestForAllTypes(
        'class on the form-element without variant',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-stacked');
            expect(
                element.classList.contains('slds-form-element_stacked')
            ).toBe(true);
            const data = JSON.parse(JSON.stringify(store));
            data.labelAlignment = 'horizontal';
            element.wireRecordUi(data);
            return Promise.resolve().then(() => {
                expect(
                    element.classList.contains('slds-form-element_horizontal')
                ).toBe(true);
            });
        },
        false,
        undefined,
        { variant: '' },
        true,
        undefined,
        true,
        false,
        'stacked'
    );
    generateTestForAllTypes(
        'class on the form-element with variant',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-hidden');
            expect(
                element.classList.contains('slds-form-element_horizontal')
            ).toBe(false);
            expect(
                element.classList.contains('slds-form-element_stacked')
            ).toBe(false);
            element.variant = 'standard';
            return Promise.resolve().then(() => {
                expect(
                    element.classList.contains('slds-form-element_horizontal')
                ).toBe(false);
                expect(
                    element.classList.contains('slds-form-element_stacked')
                ).toBe(false);
            });
        },
        false,
        undefined,
        { variant: 'label-hidden' },
        true,
        undefined,
        true,
        false,
        'stacked'
    );
    generateTestForAllTypes(
        'class on the form-element with variant change',
        element => {
            const input = element.shadowRoot.querySelector(
                'lightning-input,lightning-picklist,lightning-textarea,lightning-quill,lightning-lookup'
            );
            expect(input.variant).toEqual('label-hidden');
            expect(
                element.classList.contains('slds-form-element_horizontal')
            ).toBe(false);
            expect(
                element.classList.contains('slds-form-element_stacked')
            ).toBe(false);
            const data = JSON.parse(JSON.stringify(store));
            data.labelAlignment = 'horizontal';
            element.wireRecordUi(data);
            element.variant = '';
            return Promise.resolve().then(() => {
                expect(
                    element.classList.contains('slds-form-element_horizontal')
                ).toBe(true);
                expect(
                    element.classList.contains('slds-form-element_stacked')
                ).toBe(false);
            });
        },
        false,
        undefined,
        { variant: 'label-hidden' },
        true,
        undefined,
        true,
        false,
        'stacked'
    );
});

/* magic test generators */
function generateTestForAllTypes(
    message,
    testFunc,
    nullify = false,
    value = undefined,
    params = {},
    updateable = true,
    events,
    creatable = true,
    createMode = false,
    labelAlignment
) {
    return Object.keys(fields).forEach(fieldName => {
        it(`${message} ${fieldName}`, () => {
            const element = createInputField(
                fieldName,
                nullify,
                value,
                params,
                updateable,
                events,
                creatable,
                createMode,
                labelAlignment
            );
            return Promise.resolve().then(() => {
                return testFunc(element, fieldName);
            });
        });
    });
}

function testFieldAfterClick(fieldName, testFunc) {
    const element = createInputField(fieldName);
    return Promise.resolve().then(() => {
        const input = element.shadowRoot.querySelector('lightning-input');
        // check when click happens
        input.addEventListener('change', () => {
            // tail to make sure values are propogated
            setImmediate(() => {
                testFunc(element);
            });
        });
        input.click();
    });
}

expect.extend({
    toContainOptions(actual, expected) {
        const valueExists = valueToCheck =>
            [...actual].some(actualValue => {
                return actualValue.value === valueToCheck;
            });
        const pass = [...expected].every(expectedValue => {
            return valueExists(expectedValue);
        });

        return {
            message: () =>
                `expected the picklist to contain options: ${expected}`,
            pass,
        };
    },
});

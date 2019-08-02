import { createElement } from 'lwc';
import Element from 'lightning/inputName';
import { getLocaleTag } from '../../internationalizationLibrary/localeUtils';
import { verifyClassSet } from 'lightning/testUtils';

const createInputName = (params = {}) => {
    const element = createElement('lightning-input-name', { is: Element });
    Object.assign(element, params);
    document.body.appendChild(element);
    return element;
};

const options = [
    { label: 'None', value: 'None' },
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Ms.', value: 'Ms.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Prof.', value: 'Prof.' },
];

const fieldsToDisplay = [
    'firstName',
    'salutation',
    'lastName',
    'middleName',
    'informalName',
    'suffix',
];

const label = 'Input Name Field';

const nameField = {
    label,
    salutation: 'Mr.',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Middleton',
    informalName: 'Jo',
    suffix: 'The 3rd',
    options,
    required: true,
};
const nameFieldWithEmptyValues = {
    label,
    salutation: '',
    firstName: '',
    lastName: '',
    middleName: '',
    informalName: '',
    suffix: '',
    options,
    required: true,
    fieldsToDisplay,
};

jest.mock('../../internationalizationLibrary/localeUtils', () => ({
    getLocaleTag: jest.fn(),
}));

describe('lightning-input-name', () => {
    beforeEach(() => {
        getLocaleTag.mockReturnValue('en-US');
    });

    it('default', () => {
        const element = createInputName({ label });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('default With Required Field', () => {
        const element = createInputName({
            nameField,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('Render more Field by setting fieldsToDisplay attribute', () => {
        const element = createInputName({
            ...nameField,
            fieldsToDisplay,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('Render Input Name with values set', () => {
        const element = createInputName(nameField);
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('Render input name with locale set to language code', () => {
        getLocaleTag.mockReturnValue('ja');
        const element = createInputName(nameField);
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('Render input name with locale set to lang_Country code', () => {
        getLocaleTag.mockReturnValue('ja_JP');
        const element = createInputName(nameField);
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('readonly all the fields when readOnly is set to true', () => {
        const element = createInputName({
            ...nameField,
            readOnly: true,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('disabled all the fields when disabled is set to true', () => {
        const element = createInputName({
            ...nameField,
            disabled: true,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('Adds assistive-text class to legend when variant is set to label-hidden', () => {
        const element = createInputName({
            ...nameField,
            variant: 'label-hidden',
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it("returns 'invalid' if input name is required but lastName is not set", () => {
        const element = createInputName(nameFieldWithEmptyValues);
        expect(element.checkValidity()).toBe(false);
    });
    it("returns 'valid' if input name is required and lastName is set", () => {
        const element = createInputName(nameField);
        expect(element.checkValidity()).toBe(true);
    });

    it('renders Help Text', () => {
        const element = createInputName({
            ...nameField,
            fieldLevelHelp: 'Help Text',
        });
        return Promise.resolve().then(() => {
            const helptext = element.shadowRoot.querySelector(
                'lightning-helptext'
            );
            // Icon name is also rendered because lightning-helptext mock renders all its attribute values
            expect(helptext.shadowRoot.textContent).toBe(
                'Help Text utility:info'
            );
        });
    });
    describe('form element class', () => {
        it('form element class for default variant', () => {
            const element = createInputName(nameField);

            return Promise.resolve().then(() => {
                verifyClassSet(element, {
                    'slds-form-element': true,
                    'slds-form-element_stacked': false,
                    'slds-form-element_horizontal': false,
                });
                element.variant = 'label-stacked';
                return Promise.resolve().then(() => {
                    verifyClassSet(element, {
                        'slds-form-element': true,
                        'slds-form-element_stacked': true,
                        'slds-form-element_horizontal': false,
                    });
                });
            });
        });
        it('form element class for label-stacked variant', () => {
            const element = createInputName({
                ...nameField,
                variant: 'label-stacked',
            });
            return Promise.resolve().then(() => {
                verifyClassSet(element, {
                    'slds-form-element': true,
                    'slds-form-element_stacked': true,
                    'slds-form-element_horizontal': false,
                });
            });
        });
        it('form element class for label-inline variant', () => {
            const element = createInputName({
                ...nameField,
                variant: 'label-inline',
            });

            return Promise.resolve().then(() => {
                verifyClassSet(element, {
                    'slds-form-element': true,
                    'slds-form-element_stacked': false,
                    'slds-form-element_horizontal': true,
                });
            });
        });
    });
});

import { createElement } from 'lwc';
import Element from 'lightning/combobox';
import { verifyClassSet } from 'lightning/testUtils';

const createComponent = (params = {}) => {
    const element = createElement('lightning-combobox', {
        is: Element,
    });
    element.inputId = 'uniqueId';
    Object.assign(element, params);
    document.body.appendChild(element);
    return element;
};

describe('lightning-combobox', () => {
    it('should not be required by default', () => {
        const element = createComponent({ label: 'List Box Example' });

        expect(element.required).toBe(false);
    });

    it('should not be disabled by default', () => {
        const element = createComponent({ label: 'List Box Example' });

        expect(element.disabled).toBe(false);
    });

    describe('validity handling', () => {
        it('should be valid when value not set and required is "false"', () => {
            const element = createComponent({ label: 'List Box Example' });

            element.required = false;

            expect(element.validity.valueMissing).toBe(false);
            expect(element.validity.valid).toBe(true);
        });

        it('should be invalid when value not set and required is "true"', () => {
            const element = createComponent({ label: 'List Box Example' });

            element.required = true;

            return Promise.resolve().then(() => {
                expect(element.validity.valueMissing).toBe(true);
                expect(element.validity.valid).toBe(false);
            });
        });

        it('should be valid when value set and required is "true"', () => {
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
            });

            element.required = true;
            element.value = 'item1';

            expect(element.validity.valueMissing).toBe(false);
            expect(element.validity.valid).toBe(true);
        });

        it('should be valid when required is "true" and the component is disabled', () => {
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
            });

            element.required = true;
            element.disabled = true;

            expect(element.validity.valueMissing).toBe(false);
            expect(element.validity.valid).toBe(true);
        });

        it('should be invalid when a custom validity error is set', () => {
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
            });

            element.setCustomValidity('custom error');

            expect(element.validity.customError).toBe(true);
            expect(element.validity.valid).toBe(false);
        });

        it('should be valid when a custom validity error is set and then re-set', () => {
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
            });

            element.setCustomValidity('custom error');
            element.setCustomValidity('');

            expect(element.validity.customError).toBe(false);
            expect(element.validity.valid).toBe(true);
        });
    });

    describe('form element class', () => {
        it('form element class for default variant', () => {
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
            });

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
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
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
            const element = createComponent({
                label: 'List Box Example',
                options: [{ label: 'One', value: 'item1' }],
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

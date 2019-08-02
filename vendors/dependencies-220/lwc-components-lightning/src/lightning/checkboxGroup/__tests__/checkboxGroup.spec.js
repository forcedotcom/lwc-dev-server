import { createElement } from 'lwc';
import Element from 'lightning/checkboxGroup';
import { verifyClassSet, shadowQuerySelectorAll } from 'lightning/testUtils';

const options = [
    { label: 'Ross', value: 'option1' },
    { label: 'Rachel', value: 'option2' },
];

const defaultProps = {
    name: 'testGroup',
    label: 'testGroup',
    options,
    value: [],
};

const createCheckboxGroup = props => {
    const element = createElement('lightning-checkbox-group', { is: Element });
    Object.assign(element, defaultProps, props);
    document.body.appendChild(element);
    return element;
};

describe('lightning-checkbox-group', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('default', () => {
        const element = createCheckboxGroup();
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('one selected option', () => {
        const element = createCheckboxGroup({
            value: ['option1'],
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('required', () => {
        const element = createCheckboxGroup({
            value: [],
            required: true,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('disabled', () => {
        const element = createCheckboxGroup({
            value: ['option1'],
            disabled: true,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('required and disabled', () => {
        const element = createCheckboxGroup({
            value: ['option1'],
            required: true,
            disabled: true,
        });
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('value change from one option to the other', () => {
        const element = createCheckboxGroup({
            value: ['option1'],
        });
        return Promise.resolve()
            .then(() => {
                const inputs = shadowQuerySelectorAll(element, 'input');
                expect(inputs[0].checked).toBe(true);
                expect(inputs[1].checked).toBe(false);
                element.value = ['option2'];
            })
            .then(() => {
                const inputs = shadowQuerySelectorAll(element, 'input');
                expect(inputs[0].checked).toBe(false);
                expect(inputs[1].checked).toBe(true);
            });
    });

    it('form element class for default variant', () => {
        const element = createCheckboxGroup({
            value: ['option1'],
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
        const element = createCheckboxGroup({
            value: ['option1'],
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
        const element = createCheckboxGroup({
            value: ['option1'],
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

    it('should add slds-assistive-text to legend when variant=label-hidden', () => {
        const element = createCheckboxGroup({
            value: ['option1'],
            variant: 'label-hidden',
            required: true,
            disabled: true,
        });
        return Promise.resolve().then(() => {
            const hiddenLegend = element.shadowRoot.querySelector(
                'legend.slds-assistive-text'
            );

            expect(hiddenLegend).not.toBeNull();
        });
    });
});

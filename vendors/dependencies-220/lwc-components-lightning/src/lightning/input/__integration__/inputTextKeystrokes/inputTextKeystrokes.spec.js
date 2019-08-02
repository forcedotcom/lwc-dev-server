const INPUT_COMPONENT_PARENT = '.slds-form-element';
const INPUT_COMPONENT_PARENT_TWO = '#field2';
const FIRST_INPUT_ID = '#input-1';
const SECOND_INPUT_ID = '#input-2';
const ERROR_CLASS = 'slds-has-error';
const MAX_LENGTH = 20;
const FIRST_INPUT_VALUE = 'first';
const SECOND_INPUT_VALUE = '123';
const LABEL_ID = '#textLabel';
const BUTTON_CLASS = '.slds-button';

function expectErrorClass(elem) {
    const inputValidityClass = $(elem).getAttribute('class');
    expect(inputValidityClass).to.contain(ERROR_CLASS);
}

function applyKeystrokes(key, n = 1) {
    if (typeof key === 'string') {
        for (let i = 0; i < n; i++) {
            browser.keys(key);
        }
    } else if (typeof key === 'object') {
        key.forEach(value => {
            browser.keys(value);
        });
    }
}

describe.skip('Input text integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should toggle error class if empty and required attribute is present', () => {
        $(FIRST_INPUT_ID).waitForExist();
        const input = $(FIRST_INPUT_ID);
        input.click();
        input.setValue('Steve');
        applyKeystrokes('Backspace', 5);
        applyKeystrokes('Tab');
        expectErrorClass(INPUT_COMPONENT_PARENT);
    });

    it('should match the value of the maxlength', () => {
        $(FIRST_INPUT_ID).waitForExist();
        const maxLengthAttribute = browser
            .element(FIRST_INPUT_ID)
            .getAttribute('maxlength');
        expect(parseInt(maxLengthAttribute, 10)).to.equal(MAX_LENGTH);
    });

    it('should be invalid when the value does not match with the given character only pattern (pattern="^[a-zA-Z]+$") ', () => {
        $(FIRST_INPUT_ID).waitForExist();
        const input = $(FIRST_INPUT_ID);
        input.click();
        input.setValue('Walter123');
        applyKeystrokes('Tab');
        expectErrorClass(INPUT_COMPONENT_PARENT);
    });

    it('should be invalid when the value does not match with the given number only pattern (pattern="d+")', () => {
        $('.field2 input').waitForExist();
        const input = $('.field2 input');
        input.click();
        input.setValue('Steve Jobs');
        applyKeystrokes('Tab');
        expectErrorClass('.field2');
    });

    it('should fire onchange event when for every keystroke', () => {
        $(FIRST_INPUT_ID).waitForExist();
        const input = $(FIRST_INPUT_ID);
        input.click();
        applyKeystrokes(['P', 'O', 'E', 'T', 'R', 'Y']);
        expect($('.textLabel').getHTML(false)).to.equal('POETRY');
    });

    it('should set the value of input programmatically', () => {
        $(FIRST_INPUT_ID).waitForExist();
        $(BUTTON_CLASS).click();
        expect($(FIRST_INPUT_ID).getValue()).to.equal('Nihar');
    });

    it('should move focus to second text input when tab key is pressed', () => {
        $(SECOND_INPUT_ID).waitForExist();
        $(SECOND_INPUT_ID).setValue(SECOND_INPUT_VALUE);
        const input = $(FIRST_INPUT_ID);
        input.click();
        applyKeystrokes('Tab');
        browser.waitUntil(() => {
            return browser.shadowElementHasFocus(SECOND_INPUT_ID);
        });
        expect(browser.getValue(SECOND_INPUT_ID)).to.equal(SECOND_INPUT_VALUE);
    });

    it('should move focus back to first text input when shift+tab key is pressed', () => {
        $(SECOND_INPUT_ID).waitForExist();
        $(FIRST_INPUT_ID).setValue(FIRST_INPUT_VALUE);
        const input = $(SECOND_INPUT_ID);
        input.click();
        browser.keys(['Shift', 'Tab']);
        browser.waitUntil(() => {
            return browser.shadowElementHasFocus(FIRST_INPUT_ID);
        });
        expect(browser.getValue(FIRST_INPUT_ID)).to.equal(FIRST_INPUT_VALUE);
    });
});

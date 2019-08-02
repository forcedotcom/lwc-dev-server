const INPUT_PARENT = 'slds-form-element';
const INPUT = '.slds-input';
const ERROR_CLASS = 'slds-has-error';
const BUTTON_CLASS = '.slds-button';

function expectErrorClass(elem) {
    const classValue = $(`.${elem}`).getAttribute('class');
    expect(classValue).to.contain(ERROR_CLASS);
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

describe('Input number integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(INPUT).waitForExist();
    });

    it('should increment the number when Up arrow key is pressed', () => {
        const input = $(INPUT);
        $(BUTTON_CLASS).click();
        input.click();
        const defaultValue = input.getValue();
        applyKeystrokes('ArrowUp', 2);
        expect(parseInt(input.getValue())).to.equal(parseInt(defaultValue) + 4);
    });

    it('should decrement the number when Down arrow key is pressed', () => {
        const input = $(INPUT);
        $(BUTTON_CLASS).click();
        input.click();
        const incrementedValue = input.getValue();
        applyKeystrokes('ArrowUp', 4);
        applyKeystrokes('ArrowDown', 2);
        // Step is 2, 4 Ups and 2 Downs should be +4.
        expect(parseInt(input.getValue())).to.equal(
            parseInt(incrementedValue) + 4
        );
    });

    it('should toggle error class when invalid input is entered', () => {
        const input = $(INPUT);
        input.setValue('123ee');
        $('body').click();
        expectErrorClass(INPUT_PARENT);
    });

    it('should clear the input value when error class is toggled and focused again on input', () => {
        const input = $(INPUT);
        input.setValue('123ee');
        $('body').click();
        input.click();
        expect(input.getValue()).to.equal('');
    });

    it('should not change value on character input', () => {
        $(INPUT).waitForExist();
        const input = $(INPUT);
        input.setValue('12');
        const defaultValue = input.getValue();
        input.click();
        browser.keys('A');
        browser.keys('B');
        expect(defaultValue).to.equal(input.getValue());
    });
    it('should toggle error class when value less than min', () => {
        const input = $(INPUT);
        input.setValue('3');
        $('body').click();
        expectErrorClass(INPUT_PARENT);
    });

    it('should toggle error class when value greater than max', () => {
        const input = $(INPUT);
        input.setValue('20');
        $('body').click();
        expectErrorClass(INPUT_PARENT);
    });

    it('should toggle error class when input is empty and required attribute is present', () => {
        const input = $(INPUT);
        input.click();
        input.clearValue();
        applyKeystrokes('Tab');
        expectErrorClass(INPUT_PARENT);
    });
});

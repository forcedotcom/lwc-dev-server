const INPUT_PARENT = 'slds-form-element';
const INPUT_LABEL = '.slds-checkbox__label';
const INPUT = '#input-1';
const ERROR_CLASS = 'slds-has-error';
const BUTTON_CLASS = '.slds-button';

function getCheckboxValue(elem) {
    return $(elem).isSelected();
}

describe.skip('Input checkbox integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should set the value when clicked on checkbox', () => {
        $(INPUT_LABEL).waitForExist();
        const input = $(INPUT_LABEL);
        input.click();
        expect(getCheckboxValue(INPUT)).to.equal(true);
    });

    it('should clear the value when clicked again on checkbox', () => {
        $(INPUT_LABEL).waitForExist();
        const input = $(INPUT_LABEL);
        input.click();
        input.click();
        expect(getCheckboxValue(INPUT)).to.equal(false);
    });

    it('should set the value when space key is pressed', () => {
        $(INPUT).waitForExist();
        const input = $(INPUT_LABEL);
        browser.keys('Tab');
        browser.keys('Space');
        expect(getCheckboxValue(INPUT)).to.equal(true);
    });

    it('should clear the value when space key is pressed again', () => {
        $(INPUT).waitForExist();
        const input = $(INPUT_LABEL);
        browser.keys('Tab');
        browser.keys('Space');
        browser.keys('Space');
        expect(getCheckboxValue(INPUT)).to.equal(false);
    });

    it('should toggle the error class when empty checkbox and required attribute is present', () => {
        $(INPUT).waitForExist();
        browser.keys('Tab');
        browser.keys('Tab');
        const parentClassValue = browser
            .element(`.${INPUT_PARENT}`)
            .getAttribute('class');
        expect(parentClassValue).to.contain(ERROR_CLASS);
    });

    it('should set the checkbox value programmatically', () => {
        $(BUTTON_CLASS).waitForExist();
        $(BUTTON_CLASS).click();
        expect(getCheckboxValue(INPUT)).to.equal(true);
    });

    it('should clear the checkbox value programmatically', () => {
        $(BUTTON_CLASS).waitForExist();
        $(BUTTON_CLASS).click();
        $(BUTTON_CLASS).click();
        expect(getCheckboxValue(INPUT)).to.equal(false);
    });
});

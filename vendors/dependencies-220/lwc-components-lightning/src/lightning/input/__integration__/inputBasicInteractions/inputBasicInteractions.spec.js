const testValue = 'Hello';

const selectors = {
    checkValueButton: '.check-value-button',
    lightningInput: 'lightning-input',
    helpMessage: '[data-help-message]',
    blurInput: '.blur-input',
};

function getInputElement(shadowNode) {
    return shadowNode.shadow$('input');
}
function blur() {
    $(selectors.blurInput).click();
}
function setup() {
    const URL = browser.getStaticUrl(__filename);
    browser.url(URL);
    $(selectors.lightningInput).waitForExist();
}

describe('Basic interactions with input', () => {
    beforeEach(setup);

    it('should focus on click', () => {
        const input = $(selectors.lightningInput);

        browser.callComponentMethod(selectors.lightningInput, 'focus');

        const active = browser.getShadowActiveElement();
        const actual = browser.getElementAttribute(active.ELEMENT, 'outerHTML');
        const expected = getInputElement(input).getAttribute('outerHTML');
        expect(actual).to.equal(expected);
    });

    it('should set value of lightning-input on typing', () => {
        const input = $(selectors.lightningInput);

        getInputElement(input).setValue(testValue);
        const checkValueButton = $(selectors.checkValueButton);
        checkValueButton.click();

        const actual = $('.input-value').getAttribute('innerText');
        expect(actual).to.equal(testValue);
    });

    it('should reset the native input value when empty value is passed', () => {
        const input = $(selectors.lightningInput);

        getInputElement(input).setValue(testValue);
        browser.setComponentAttribute(selectors.lightningInput, 'value', '');

        expect(getInputElement(input).getValue()).to.equal('');
    });
});

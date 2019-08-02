const testValue = 'Hello';

function setErrorMessages() {
    Object.keys(testErrorMessages).forEach(m => {
        browser.setComponentAttribute(
            selectors.lightningInput,
            m,
            testErrorMessages[m]
        );
    });
}

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
    setErrorMessages();
}

const testErrorMessages = {
    messageWhenValueMissing: 'The value is missing',
    messageWhenTypeMismatch: 'Type mismatch error',
    messageWhenStepMismatch: 'Step mismatch',
};

describe('Validation', () => {
    beforeEach(setup);

    it("shouldn't  trigger validation on focus", () => {
        const input = $(selectors.lightningInput);
        browser.setComponentAttribute(
            selectors.lightningInput,
            'required',
            true
        );

        input.click();

        const helpMessageVisibility = $(selectors.helpMessage).isExisting();
        expect(helpMessageVisibility).to.equal(false);
    });

    it('should trigger validation error on blur with value missing', () => {
        const input = $(selectors.lightningInput);
        browser.setComponentAttribute(
            selectors.lightningInput,
            'required',
            true
        );

        input.click();
        $(selectors.blurInput).click();

        const helpMessageElement = $(selectors.helpMessage);
        expect(helpMessageElement.isExisting()).to.equal(true);
        expect(helpMessageElement.getText()).to.equal(
            testErrorMessages.messageWhenValueMissing
        );
    });

    it('should trigger validation error on pattern mismatch', () => {
        const input = $(selectors.lightningInput);
        browser.setComponentAttribute(selectors.lightningInput, 'type', 'url');

        input.click();
        getInputElement(input).setValue(testValue);
        blur();

        const helpMessageElement = $(selectors.helpMessage);
        expect(helpMessageElement.isExisting()).to.equal(true);
        expect(helpMessageElement.getText()).to.equal(
            testErrorMessages.messageWhenTypeMismatch
        );
    });

    it('should trigger validation error on step mismatch', () => {
        const input = $(selectors.lightningInput);
        browser.setComponentAttribute(
            selectors.lightningInput,
            'type',
            'number'
        );
        browser.setComponentAttribute(selectors.lightningInput, 'step', '5');
        browser.setComponentAttribute(selectors.lightningInput, 'min', '10');

        input.click();
        getInputElement(input).setValue('11');
        blur();

        const helpMessageElement = $(selectors.helpMessage);
        expect(helpMessageElement.isExisting()).to.equal(true);
        expect(helpMessageElement.getText()).to.equal(
            testErrorMessages.messageWhenStepMismatch
        );
    });
});

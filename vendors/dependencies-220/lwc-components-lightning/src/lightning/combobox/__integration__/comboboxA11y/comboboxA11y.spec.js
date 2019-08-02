const COMBOBOX = 'lightning-combobox';
const LIST_BOX = '[role="listbox"]';
const OUTPUT = '.selected-option';

function assertIsActive(comboboxInput, input) {
    const ariaAttribute = browser
        .element(comboboxInput)
        .getAttribute(ARIA_ACTIVEDESCENDANT);
    expect(ariaAttribute).to.equal(input);
}

function setup() {
    const URL = browser.getStaticUrl(__filename);
    browser.url(URL);
}

describe('Using the mouse', () => {
    beforeEach(setup);

    it('should select the option when the option is clicked', () => {
        const combobox = $(COMBOBOX);
        combobox.click();
        $(LIST_BOX, 500).waitForDisplayed();
        $('[data-value="two"]').click();
        browser.waitUntil(
            () => {
                lastValue = $(OUTPUT).getText();
                return lastValue === 'two';
            },
            500,
            `Expected two after 500ms`
        );
    });

    it('close when the mouse is clicked outside the combobox', () => {
        const combobox = $(COMBOBOX);
        combobox.click();
        $(LIST_BOX, 500).waitForDisplayed();
        $(OUTPUT).click();
        browser.waitUntil(
            () => {
                return !$(LIST_BOX).isDisplayed();
            },
            500,
            'Expected list box to be hidden'
        );
    });
});

describe('Using the keyboard', () => {
    beforeEach(setup);

    // the pause() is here because sending the keys too fast
    // appears to cause weird issue with browser window focus
    // in reality no human can send keys with only a 10ms delay
    it('should select an option with the keyboard', () => {
        $(COMBOBOX).waitForDisplayed(500);
        $(COMBOBOX).click();
        $(LIST_BOX).waitForDisplayed(500);
        browser.keys('ArrowDown');
        browser.pause(10);
        browser.keys('Return');
        browser.waitUntil(
            () => {
                lastValue = $(OUTPUT).getText();
                return lastValue === 'two';
            },
            500,
            `Expected 'two' after 500ms`
        );
    });

    it('select an option when using the up arrow', () => {
        $(COMBOBOX).waitForDisplayed(500);
        $(COMBOBOX).click();
        $(LIST_BOX).waitForDisplayed(500);
        browser.pause(30);
        browser.keys('ArrowUp');
        browser.pause(30);
        browser.keys('Return');
        browser.waitUntil(
            () => {
                lastValue = $(OUTPUT).getText();
                return lastValue === 'three';
            },
            600,
            `Expected selection to be 'three' after 500ms`
        );
    });
});

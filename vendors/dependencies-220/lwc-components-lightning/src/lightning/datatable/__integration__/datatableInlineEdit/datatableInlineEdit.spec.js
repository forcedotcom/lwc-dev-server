const assert = require('assert');

const FIRST_CHECKBOX =
    'lightning-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > lightning-primitive-cell-checkbox > span > label';
const SECOND_CHECKBOX =
    'lightning-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > lightning-primitive-cell-checkbox > span > label';
const EDIT_PENCIL_FIRST_DATE_CELL =
    'lightning-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(6) > lightning-primitive-cell-factory > lightning-primitive-cell-wrapper > lightning-primitive-cell-editable-button > button';
const EDIT_PENCIL_FIRST_NAME_CELL =
    'lightning-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > th > lightning-primitive-cell-factory > lightning-primitive-cell-wrapper > lightning-primitive-cell-editable-button > button';
const MASS_IEDIT_CHECKBOX =
    'lightning-datatable > div:nth-child(2) > lightning-primitive-datatable-iedit-panel > section > div.slds-popover__body > form > lightning-input > div > span > label';
const ACCEPT_BTN =
    'lightning-datatable > div:nth-child(2) > lightning-primitive-datatable-iedit-panel > section > div.slds-popover__footer > div > lightning-button:nth-child(2) > button';
const BOTTOM_BAR =
    'lightning-datatable > div:nth-child(2) > lightning-primitive-datatable-status-bar';
const SUPPRESS_BAR_BTN = '.suppress-btn';

function assertActiveElementValue(expected) {
    const active = browser.getShadowActiveElement();
    const value = browser.getElementAttribute(active.ELEMENT, 'value');
    expect(value).to.equal(expected);
}
describe('lightning-datatable tabbing with inline edit', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should apply the edited value to all the selected rows when mass inline was selected', () => {
        $(FIRST_CHECKBOX).click();
        $(SECOND_CHECKBOX).click();
        $(EDIT_PENCIL_FIRST_DATE_CELL).click();
        $(MASS_IEDIT_CHECKBOX).click();
        $(ACCEPT_BTN).click();
    });
    it('should show the save/cancel bottom bar when there are draft values', () => {
        $(EDIT_PENCIL_FIRST_NAME_CELL).click();
        browser.keys('abc');
        browser.keys('Enter');
        expect($(BOTTOM_BAR).isExisting()).to.equal(true);
    });
    it('should not show the save/cancel bottom bar when there are draft values and suppress-bottom-bar', () => {
        $(SUPPRESS_BAR_BTN).click();
        $(EDIT_PENCIL_FIRST_NAME_CELL).click();
        browser.keys('abc');
        browser.keys('Enter');
        try {
            $(BOTTOM_BAR).waitForExist(undefined, true);
        } catch (e) {
            // IE11 Driver 2.53.1 will throw exception
        }
    });
    it('should stop press ESC event when table is in ACTION mode & editing a cell', () => {
        $(EDIT_PENCIL_FIRST_NAME_CELL).click();
        browser.keys('Escape');
        expect($('.code').getText()).to.equal('');
        browser.keys(['ArrowLeft', 'Enter']);
        expect($('.code').getText()).to.equal('13');
        browser.keys('ArrowRight');
        expect($('.code').getText()).to.equal('39');
        browser.keys('Escape');
        expect($('.code').getText()).to.equal('39');
        browser.keys('Escape');
        expect($('.code').getText()).to.equal('27');
    });
    // // W-4756059
    it('should open inline-edit when possible', function() {
        if (browser.capabilities.browserName === 'internet explorer') {
            this.skip();
            return;
        }
        const firstCell = 'tbody tr:nth-child(1) th';
        $(firstCell).click();

        // Enter action mode
        browser.keys('Enter');
        assertActiveElementValue('John Snow');

        browser.keys('Tab');
        assertActiveElementValue('30');

        browser.keys('Tab');
        const active = browser.getShadowActiveElement();
        const textValue = browser.getElementAttribute(
            active.ELEMENT,
            'outerHTML'
        );
        assert(
            textValue.indexOf('john.snow@salesforce.com') >= 0,
            'Focus should be in 3rd cell'
        );

        browser.keys(['Shift', 'Tab', 'NULL']); // NULL needs to be sent at the end in order to release the action key (shift)
        assertActiveElementValue('30');

        browser.keys(['Shift', 'Tab', 'NULL']);
        assertActiveElementValue('John Snow');
    });
});

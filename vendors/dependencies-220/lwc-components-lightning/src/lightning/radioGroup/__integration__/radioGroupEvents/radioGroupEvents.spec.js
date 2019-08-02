const INPUT = 'lightning-radio-group';
const SECOND_CHOICE = '.slds-radio:last-child .slds-form-element__label';
const OUT = '.out';

describe('Radio group events', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('includes the value  with the change event', () => {
        $(INPUT).waitForExist();
        $(SECOND_CHOICE).click();
        expect($(OUT).getText()).to.equal('option2');
    });
});

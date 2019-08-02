const INPUT = '.slds-form-element__label';
const IS_CHECKED_EL = '.is-checked';
const IS_CHECKED_VIA_CLICK = '.is-checked-via-click';

describe('Input checkbox events', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('includes the checked state with the change event', () => {
        $(INPUT).waitForExist();
        $(INPUT).click();
        const text = $(IS_CHECKED_EL).getText();
        expect(text).to.equal('true');
    });

    it('has changed the checked state to true on the click event', () => {
        $(INPUT).waitForExist();
        $(INPUT).click();
        const text = $(IS_CHECKED_VIA_CLICK).getText();
        expect(text).to.equal('true');
    });
});

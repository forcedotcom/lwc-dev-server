const INPUT = 'label';
const IS_CHECKED_EL = '.is-checked';
const IS_CHECKED_VIA_CLICK = '.is-checked-via-click';

describe('Input checkbox button events', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(INPUT).waitForExist();
    });

    it('include the checked state with the change event', () => {
        $(INPUT).click();
        const text = $(IS_CHECKED_EL).getText();
        expect(text).to.equal('true');
    });

    it('has changed the checked state to true on the click event', () => {
        $(INPUT).click();
        const text = $(IS_CHECKED_VIA_CLICK).getText();
        expect(text).to.equal('true');
    });
});

const BUTTON_ICON_STATEFUL = 'lightning-button-icon-stateful';

describe('lightning-button-icon-stateful integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(BUTTON_ICON_STATEFUL).waitForExist();
    });

    it('should delegate focus', () => {
        $(BUTTON_ICON_STATEFUL).click();
        expect(browser.shadowElementHasFocus('button')).to.equal(true);
    });
});

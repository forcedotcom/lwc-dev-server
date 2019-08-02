const BUTTON_ICON = 'lightning-button-icon';

describe('lightning-button-icon integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(BUTTON_ICON).waitForExist();
    });

    it('should delegate focus', () => {
        $(BUTTON_ICON).click();
        expect(browser.shadowElementHasFocus('button')).to.equal(true);
    });
});

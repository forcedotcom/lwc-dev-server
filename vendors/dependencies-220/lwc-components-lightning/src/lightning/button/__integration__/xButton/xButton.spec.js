const LIGHTNING_BUTTON = 'lightning-button';

describe('lightning-button integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(LIGHTNING_BUTTON).waitForExist();
    });

    it('should change the label when the button is clicked!', () => {
        const button = $('lightning-button');
        button.click();
        expect(button.getAttribute('label')).to.equal('I was clicked!!');
    });

    it('should delegate focus', () => {
        $(LIGHTNING_BUTTON).click();
        const result = browser.shadowElementHasFocus('button');
        expect(result).to.equal(true);
    });
});

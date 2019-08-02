const INPUT = 'lightning-input';
const OUTPUT = '.out';
describe('Input search', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(INPUT).waitForExist();
    });

    it('should include the value in the detail', () => {
        $('lightning-input').click();
        browser.keys('hello world');
        expect($(OUTPUT).getText()).to.equal('hello world');
    });

    it('clicking the clear button should clear the input and fire a change event', () => {
        $('lightning-input').click();
        browser.keys('hello world');
        browser.pause(100);
        $('lightning-input button').click();
        expect($(OUTPUT).getText()).to.equal('');
    });
});

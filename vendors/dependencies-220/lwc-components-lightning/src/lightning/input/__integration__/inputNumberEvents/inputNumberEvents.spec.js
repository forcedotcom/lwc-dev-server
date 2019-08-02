const INPUT = 'lightning-input';
const OUTPUT = '.out';

describe('Input number events', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('includes the new value with the change event detail', () => {
        $(INPUT).waitForExist();
        const input = $(INPUT);
        input.click();
        browser.keys('123');
        expect($(OUTPUT).getText()).to.equal('123');
    });
});

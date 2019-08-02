const RENDERER = 'lightning-button.renderer';

describe('Datatable custom cell rendering', () => {
    it('should render the age value with the text "years old"', () => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(RENDERER).click();
        const actualText = $$('lightning-primitive-cell-types')[1].getAttribute(
            'innerText'
        );
        const expectedText = '35 years old';
        expect(actualText).to.equal(expectedText);
    });
});

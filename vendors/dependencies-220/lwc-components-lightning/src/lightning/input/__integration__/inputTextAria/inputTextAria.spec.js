describe.skip('Input text aria-described-by', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('points to the message when invalid', () => {
        $('lightning-input').waitForExist();
        const input = $('lightning-input');
        input.click();
        browser.pause(10);
        $('.blurtarget').click();

        const describedby = $('lightning-input input').getAttribute(
            'aria-describedby'
        );
        const label = $(`#${describedby}`).getText();
        expect(label).to.be.ok;
    });

    it('has no aria-describedby when valid', () => {
        $('lightning-input').waitForExist();
        const input = $('lightning-input');

        browser.pause(10);
        input.click();
        browser.pause(10);
        $('.blurtarget').click();
        input.click();
        browser.keys('hello');
        $('.blurtarget').click();
        browser.pause(10);

        const describedby = $('lightning-input input').getAttribute(
            'aria-describedby'
        );
        expect(describedby).to.be.null;
    });
});

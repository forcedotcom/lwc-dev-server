describe('Browser open', () => {
    it('browser opens google', async () => {
        await browser.url('http://google.com');
        console.log(await (await browser.$('body')).getText());
    });
});

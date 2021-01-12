import PreviewPage from '../pageObjects/PreviewPage';

describe('@salesforce/apiFunction Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'apiFunction');

        await page.open();

        const title = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/header/div[1]/div[2]/h2'
            )
        );
        const titleText = await title.getText();

        expect(titleText).toBe('ApiFunction');
    });

    it('reload the clock', async () => {
        let page = new PreviewPage('c', 'apiFunction');

        await page.open();

        const clock = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/c-clock/lightning-formatted-date-time'
            )
        );
        const button = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/lightning-button/button'
            )
        );
        const clockBefore = await clock.getText();
        await browser.pause(2000);
        await button.click();
        const clockAfter = await clock.getText();

        expect(clockBefore).not.toEqual(clockAfter);
    });
});

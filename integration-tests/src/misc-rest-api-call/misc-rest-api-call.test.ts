import PreviewPage from '../pageObjects/PreviewPage';

describe('@salesforce/miscRestApiCall Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'miscRestApiCall');

        await page.open();

        const title = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/header/div[1]/div[2]/h2'
            )
        );
        expect(await title.getText()).toBe('MiscRestApiCall');
    });

    it('perform REST API call', async () => {
        let page = new PreviewPage('c', 'miscRestApiCall');

        await page.open();

        const button = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/lightning-layout/slot/lightning-layout-item[2]/slot/lightning-button/button'
            )
        );
        const listItem = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/p[1]'
            )
        );
        button.click();
        await listItem.waitForExist(5000);
        expect(await listItem.isExisting()).toBe(true);
    });
});

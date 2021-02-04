import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:wireGetPicklistValues Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'wireGetPicklistValues');
        await page.open();
        const title = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/header/div[1]/div[2]/h2/span'
            )
        );
        const list = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div/slot/div'
            )
        );
        await list.waitForExist(50000);
        expect(await list.getText()).toBe('something');
    });
});

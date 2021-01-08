import PreviewPage from '../pageObjects/PreviewPage';

describe('wireCurrentPageReference component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'wireCurrentPageReference');
        await page.open();
        const content = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/pre'
            )
        );
        const contentText = JSON.parse(await content.getText());
        expect(contentText.attributes.name).toBe('wireCurrentPageReference');
    });
});

import PreviewPage from '../pageObjects/PreviewPage';

describe('MiscContentAsset Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'miscContentAsset');
        await page.open();
        const content = await page.container
            .then(el => el.$('div.preview-content'))
            .then(el => el.$('.container'))
            .then(el => el.$('localdevserver-dynamic'));
        const contentText = (await content.getText()).split('\n');
        expect(contentText[0]).toBe('MiscContentAsset');
        expect(contentText[1]).toBe('Use content assets.');
        expect(contentText[2]).toBe('View Source');
    });

    it('shows the asset', async () => {
        let page = new PreviewPage('c', 'miscContentAsset');
        await page.open();
        const image = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/img'
            )
        );
        const size = await image.getSize();
        expect(size.width).toBe(128);
    });
});

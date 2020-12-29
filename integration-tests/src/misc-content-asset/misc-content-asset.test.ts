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
});

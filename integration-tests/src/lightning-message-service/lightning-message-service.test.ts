import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:lightningMessageService Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'lightningMessageService');
        const document = await page.open();
        const errorElement = await document.$$('localdevserver-error');
        expect(errorElement.length).toBe(1);
    });
});

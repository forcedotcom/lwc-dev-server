import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:apexContinuation Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'apexContinuation');
        let document = await page.open();
        const errorElement = await document.$$('localdevserver-error');
        expect(errorElement.length).toBe(1);
    });
});

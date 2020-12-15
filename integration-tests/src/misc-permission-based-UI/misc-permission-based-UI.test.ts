import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:miscPermissionBasedUI Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'miscPermissionBasedUI');
        const document = await page.open();
        const errorElement = await document.$$('localdevserver-error');
        expect(errorElement.length).toBe(1);
    });
});

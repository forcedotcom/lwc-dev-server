import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:miscPermissionBasedUI Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'miscPermissionBasedUI');
        const errorText =
            "The component named 'c/miscPermissionBasedUI' was not found. Only components within the project namespace can be previewed.";
        await page.open();
        const errorHeader = await page.container
            .then(el => el.$('localdevserver-error'))
            .then(el => el.shadow$('div.slds-modal__container'))
            .then(el => el.$('h1.error-message.slds-text-heading_large'));
        expect(await errorHeader.getText()).toBe(errorText);
    });
});

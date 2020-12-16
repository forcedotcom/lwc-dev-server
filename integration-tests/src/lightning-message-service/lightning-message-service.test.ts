import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:lightningMessageService Component', () => {
    it('loads', async () => {
        const errorText =
            "The component named 'c/lightningMessageService' was not found. Only components within the project namespace can be previewed.";
        let page = new PreviewPage('c', 'lightningMessageService');
        await page.open();
        const errorHeader = await page.container
            .then(el => el.$('localdevserver-error'))
            .then(el => el.shadow$('div.slds-modal__container'))
            .then(el => el.$('h1.error-message.slds-text-heading_large'));
        expect(await errorHeader.getText()).toBe(errorText);
    });
});

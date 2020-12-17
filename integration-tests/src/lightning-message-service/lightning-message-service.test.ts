import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:lightningMessageService Component', () => {
    it('loads', async () => {
        const errorText =
            "You can't preview a component using Lightning Message Service. Test the component directly in the org.";
        let page = new PreviewPage('c', 'lightningMessageService');
        await page.open();
        const errorHeader = await page.container
            .then(el => el.$('localdevserver-error'))
            .then(el => el.shadow$('div.slds-modal__container'))
            .then(el => el.$('h1.error-message.slds-text-heading_large'));
        const errorMessage = await errorHeader.getText();
        expect(errorMessage.includes(errorText)).toBe(true);
    });
});

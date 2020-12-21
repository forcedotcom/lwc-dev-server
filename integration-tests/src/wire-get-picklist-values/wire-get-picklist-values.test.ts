import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:wireGetPicklistValues Component', () => {
    it('loads', async () => {
        const errorText =
            "Couldn't find the compiled component. If this component has a dependency on a component in the org or a component in a package in the org, test this component directly in the org.";
        let page = new PreviewPage('c', 'wireGetPicklistValues');
        await page.open();
        const errorHeader = await page.container
            .then(el => el.$('localdevserver-error'))
            .then(el => el.shadow$('div.slds-modal__container'))
            .then(el => el.$('h1.error-message.slds-text-heading_large'));
        const errorMessage = await errorHeader.getText();
        expect(errorMessage.includes(errorText)).toBe(true);
    });
});

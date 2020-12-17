import PreviewPage from '../pageObjects/PreviewPage';
import path from 'path';

describe('@salesforce/apexContinuation Component', () => {
    it('loads', async () => {
        const errorText =
            'Error during compilation: Could not load @salesforce/apexContinuation/ApexContinuationClass.startRequest (imported by ' +
            __dirname +
            "/project/force-app/main/default/lwc/apexContinuation/apexContinuation.js): You can't preview a component using Apex Continuation. Test the component directly in the org";

        let page = new PreviewPage('c', 'apexContinuation');

        await page.open();

        const errorHeader = await page.container
            .then(el => el.$('localdevserver-error'))
            .then(el => el.shadow$('div.slds-modal__container'))
            .then(el => el.$('h1.error-message.slds-text-heading_large'));
        expect(await errorHeader.getText()).toBe(errorText);
    });
});

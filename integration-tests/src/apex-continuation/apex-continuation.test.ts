import PreviewPage from '../pageObjects/PreviewPage';

describe('@salesforce/apexContinuation Component', () => {
    
    const errorText =
        "Error during compilation: Could not load @salesforce/apexContinuation/ApexContinuationClass.startRequest (imported by /Users/shelby.holden/workspace/local-dev/lwc-dev-server/integration-tests/src/apex-continuation/project/force-app/main/default/lwc/apexContinuation/apexContinuation.js): You can't preview a component using Apex Continuation. Test the component directly in the org";

    it('loads', async () => {
        let page = new PreviewPage('c', 'apexContinuation');

        await page.open();

        const errorHeader = await page.container
            .then(el => el.$('localdevserver-error'))
            .then(el => el.shadow$('div.slds-modal__container'))
            .then(el => el.$('h1.error-message.slds-text-heading_large'));
        expect(await errorHeader.getText()).toBe(errorText);
    });
});

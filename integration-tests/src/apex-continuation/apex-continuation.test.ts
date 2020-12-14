import PreviewPage from '../pageObjects/PreviewPage';

describe('@salesforce/apexContinuation Component', () => {
    const errorText =
        "Error during compilation: Could not load @salesforce/apexContinuation/ApexContinuationClass.startRequest (imported by /Users/shelby.holden/workspace/local-dev/lwc-dev-server/integration-tests/src/apex-continuation/project/force-app/main/default/lwc/apexContinuation/apexContinuation.js): You can't preview a component using Apex Continuation. Test the component directly in the org";

    it('loads', async () => {
        let page = new PreviewPage('c', 'apexContinuation');
        await page.open();

        // Confirm error message
        const localdevserver_view = await browser
            .$('localdevserver-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('localdevserver-view'));

        const localdevserver_dynamic = await localdevserver_view.shadow$(
            'localdevserver-dynamic'
        );
        const localdevserver_layout_section = await localdevserver_dynamic.shadow$(
            'localdevserver-layout-section'
        );
        const localdevserver_error = await localdevserver_layout_section.$(
            'localdevserver-error'
        );

        const tmp1 = await localdevserver_error.shadow$(
            'div.slds-modal__container'
        );
        const tmp2 = await tmp1.$('h1.error-message.slds-text-heading_large');
        expect(await tmp2.getText()).toBe(errorText);
    });
});

import PreviewPage from '../pageObjects/PreviewPage';

describe('@salesforce/apexContinuation Component', () => {
    const errorText = "Error during compilation: Could not load @salesforce/apexContinuation/ApexContinuationClass.startRequest (imported by /Users/shelby.holden/workspace/local-dev/lwc-dev-server/integration-tests/src/apex-continuation/project/force-app/main/default/lwc/apexContinuation/apexContinuation.js): You can't preview a component using Apex Continuation. Test the component directly in the org";

    it('loads', async () => {
        let page = new PreviewPage('c', 'apexContinuation');
        await page.open();

        // Confirm error message
        const start = await page.testComponent;

        const shadowResults = await start.shadow$$('*');
        const normalResults = await start.$$('*');

        const tmp = '';
        // Confirm error message
        // const errorMessage = await page.testComponent
        //     .then(el => el.shadow$('slot'))
        //     .then(el => el.$('.preview-content'))
        //     .then(el => el.$('localdevserver-error'))
        //     .then(el => el.shadow$('h1.error-message'));
        // expect(await errorMessage.getText()).toBe(errorText);

            // Confirm error message
            //     const errorMessage = await page.testComponent
            //     .then(el => el.$('localdevserver-error'))
            //     .then(el => el.shadow$('h1.error-message'));
            // expect(await errorMessage.getText()).toBe(errorText);

    });
});

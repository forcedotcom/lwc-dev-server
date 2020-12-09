import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:apexContinuation Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'apexContinuation');
        await page.open();

        // Verify the error message container are present
        const lightningButtons = await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$$('error-message'));

        expect(lightningButtons.length).toEqual(1);
    });
});

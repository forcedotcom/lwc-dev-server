import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:file-upload Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'fileUpload');
        await page.open();

        const fileUpload = await page.testComponent.then(el =>
            el.shadow$$('lightning-file-upload')
        );
        expect(fileUpload.length).toBe(1);

        const lightningInput = await fileUpload[0].shadow$('lightning-input');

        const lightningInputTextElements = await lightningInput.shadow$$(
            'span'
        );

        expect(await lightningInputTextElements[1].getText()).toBe(
            'Attach receipt'
        );
    });
});

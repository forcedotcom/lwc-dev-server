import PreviewTestComponentPage from '../pageObjects/PreviewTestComponentPage';

describe('Labels', () => {
    it('displays the known label', async () => {
        await PreviewTestComponentPage.open();
        const labelEl = await PreviewTestComponentPage.testComponent.then(el =>
            el.shadow$('.label-known')
        );
        const text = await labelEl.getText();
        expect(text).toBe('Test Label');
    });

    it('displays a placeholder for unknown labels', async () => {
        await PreviewTestComponentPage.open();
        const labelEl = await PreviewTestComponentPage.testComponent.then(el =>
            el.shadow$('.label-unknown')
        );
        const text = await labelEl.getText();
        expect(text).toBe('{unknown label: c.labelUnknown}');
    });
});

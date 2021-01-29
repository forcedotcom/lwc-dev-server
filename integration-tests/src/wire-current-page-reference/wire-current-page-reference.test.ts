import PreviewPage from '../pageObjects/PreviewPage';

describe('wireCurrentPageReference component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'wireCurrentPageReference');
        await page.open();
        const expectedText =
            '{\n  "attributes": {\n    "namespace": "c",\n    "name": "wireCurrentPageReference"\n  },\n  "state": {}\n}';
        const content = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/pre'
            )
        );
        const contentText = await content.getText();
        expect(contentText).toBe(expectedText);
    });
});

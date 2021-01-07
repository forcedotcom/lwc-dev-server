import PreviewPage from '../pageObjects/PreviewPage';

describe('misc-modal component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'miscModal');
        await page.open();

        const component = await page.container
            .then(el => el.$('div.preview-content'))
            .then(el => el.$('div.container'))
            .then(el => el.shadow$('localdevserver-dynamic'))
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.shadow$('article'))
            .then(el => el.$('header'));
        const title = await component.getText();
        expect(title).toBe('MiscModal');
    });
    it('show modal', async () => {
        let page = new PreviewPage('c', 'miscModal');
        await page.open();

        const modalHeaderInput = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/lightning-input[1]/div/input'
            )
        );
        const modalBodyInput = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/lightning-input[2]/div/input'
            )
        );
        const showModalButton = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/lightning-button/button'
            )
        );
        const modalHeader = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/c-modal/section/div/header/h2'
            )
        );
        const modalContent = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/div/localdevserver-dynamic/lightning-card/article/div[1]/slot/div/c-modal/section/div/div'
            )
        );
        const theModalHeaderValue = await modalHeaderInput.getValue();
        const theModalBody = await modalBodyInput.getValue();
        showModalButton.click();

        modalHeader.waitForExist(1000);

        const modalHeaderText = await modalHeader.getText();
        const modalContentText = await modalContent.getText();
        expect(theModalHeaderValue).toBe('The modal header');
        expect(theModalHeaderValue).toBe(modalHeaderText);

        expect(theModalBody).toBe('The modal content');
        expect(theModalBody).toBe(modalContentText);
    });
});

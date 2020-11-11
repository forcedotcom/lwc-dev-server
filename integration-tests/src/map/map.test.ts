import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning-map Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'map');
        await page.open();

        const map = await page.testComponent
            .then(el => el.shadow$('lightning-map'))
            .then(el => el.shadow$('.slds-map_container'))
            .then(el => el.$('.slds-map'));

        expect(await map.$('lightning-primitive-iframe')).toBeTruthy();
    });
});

import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:empApi Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'empApiLWC');
        await page.open();

        // Verify the label input for 'Channel Name'
        const lightningInputLabel = await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$('lightning-input'));
        expect(await lightningInputLabel.getText()).toBe('Channel Name');

        // Verify the subscribe and unsubscribe lightning buttons are present
        const lightningButtons = await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$$('lightning-button'));

        expect(lightningButtons.length).toEqual(2);
        expect(
            await lightningButtons[0].shadow$('button[title="Subscribe"')
        ).toBeTruthy();
        expect(
            await lightningButtons[1].shadow$('button[title="Unsubscribe"')
        ).toBeTruthy();
    });
});

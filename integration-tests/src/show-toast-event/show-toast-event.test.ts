import e from 'express';
import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:platformShowToastEvent Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'showToastEventLWC');
        await page.open();

        // Verify the button 'Show Toast' is present.
        const lightningButton = await page.testComponent
            .then(el => el.shadow$('lightning-button'))
            .then(el => el.shadow$('button'));
        expect(await lightningButton.getText()).toBe('Show Toast');
        expect(await lightningButton.getAttribute('class')).toBe('slds-button slds-button_neutral');
    });
});

import fs from 'fs-extra';
import path from 'path';
import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:formatted-address Component', () => {
    it('loads', async () => {
        let page = new PreviewPage('c', 'formattedAddress');
        await page.open();

        const formattedAddresses = await page.testComponent.then(el => el.shadow$$('lightning-formatted-address'));
        expect(formattedAddresses.length).toBe(2);

        // Verify address1 contains a google link
        const googleLinkElement = await formattedAddresses[0].shadow$('a');
        expect(await googleLinkElement.getText()).toBe('121 Spear St.\nSan Francisco, CA 94105\nUS');
        expect(await googleLinkElement.getAttribute('href')).toBe('https://www.google.com/maps?q=121%20Spear%20St.%0ASan%20Francisco,%20CA%2094105%0AUS');

        // Verify address2 is plain text
        const plainTextElement = formattedAddresses[1];
        const children = await plainTextElement.shadow$$('*');
        expect(children.length).toBe(3);
        expect(await plainTextElement.$$('*').length).toBe(undefined);

        // Verify address2 only contains children that are plain text
        expect(await children[0].getHTML()).toBe('<div class="slds-truncate">121 Spear St.</div>');
        expect(await children[1].getHTML()).toBe('<div class="slds-truncate">San Francisco, CA 94105</div>');
        expect(await children[2].getHTML()).toBe('<div class="slds-truncate">US</div>');
    });
});

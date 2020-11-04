import fs from 'fs-extra';
import path from 'path';
import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:formatted-address Component', () => {
    const lwcFolder = path.join(
        __dirname,
        'project/force-app/main/default/lwc'
    );

    it('loads', async () => {
        let page = new PreviewPage('c', 'formattedAddress');
        await page.open();

        const parent = await page.testComponent.then(el =>
            el.shadow$('lightning-formatted-address')
        );

        expect(parent.getSize()).toBe(2);

        // Grab the google link reference
        const googleLink = await page.testComponent
            .then(el => el.shadow$('lightning-formatted-address'))
            .then(el => el.$('a'));
        // $$ - no elements found (but doesn't error)
        // $ - finds an element, but errors with '"no such element: Unable to locate element: {\"method\":\"css selector\",\"selector\":\"a\"}\n  (Session info: chrome=86.0.4240.183)\n  (Driver info: chromedriver=2.43.600229 (3fae4d0cda5334b4f533bede5a4787f7b832d052),platform=Mac OS X 10.14.6 x86_64)"'

        // There should only be one link available within lightning-formatted-address
        // expect(googleLink.length).toBe(1);   Size is 0 when using $$.
        expect(googleLink.getSize()).toBe(1);

        // const link = googleLink.getAttribute('href');

        // const googleLink = await page.testComponent.then(el =>
        //     el.shadow$('lightning-formatted-address').getAttribute('href')
        // );

        // const googleLink = await page.testComponent.then(el =>
        //     el.shadow$('lightning-formatted-address').getHTML()
        // );

        // TODO - verify google link text is:
        //https://www.google.com/maps?q=121%20Spear%20St.%0ASan%20Francisco,%20CA%2094105%0AUS

        const gothere = '';
    });
});

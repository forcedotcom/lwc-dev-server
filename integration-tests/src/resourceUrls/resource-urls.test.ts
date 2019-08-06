/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

// disabled: if authed locally this will work, but for real usage need to find a
// way to mock or configure the auth.
import PreviewPage from '../pageObjects/PreviewPage';

describe('Static Resources', () => {
    it('Test Images', async () => {
        // static resources page from lwc-recipes
        let page = new PreviewPage('c', 'miscStaticResource');
        await page.open();

        // Grab both the image elements
        const imageList = await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$$('img'));

        // Run a script to check if each image is on the page
        let results = [];
        for (let i = 0; i < imageList.length; i++) {
            const imgTag = imageList[i];
            let scriptToRun =
                'return arguments[0].complete && typeof arguments[0].naturalWidth != "undefined" && arguments[0].naturalWidth > 0';
            results.push(browser.execute(scriptToRun, imgTag));
        }
        results = await Promise.all(results);

        // Verify both images are on the page
        results.forEach(element => {
            expect(element).toBe(true);
        });

        return Promise.resolve('Done');
    });

    it('Test Javascript Libraries', async () => {
        let page = new PreviewPage('c', 'libsChartjs');
        await page.open();

        // Grab the canvas element
        const canvas = await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$('canvas'));

        // Check if canvas is rendered (if its rendered, there will be many siblings to the canvas element / otherwise the div will just have an empty canvas element)
        let scriptToRun =
            'return arguments[0].parentElement.childNodes.length > 1';
        const isRendered = await browser.execute(scriptToRun, canvas);
        expect(isRendered).toBe(true);

        return Promise.resolve('Done');
    });
});

/**
 * @jest-environment ./environment/CliEnvironment.js
 */

// disabled: if authed locally this will work, but for real usage need to find a
// way to mock or configure the auth.
import PreviewPage from '../pageObjects/PreviewPage';

describe('Check that our static resources are there', () => {
    it('Test Images', async () => {
        let page = new PreviewPage('c', 'miscStaticResource');
        await page.open();
        return page.testComponent.then(e => e.shadow$('lightning-card'));
    });

    it('Test Javascript Libraries', async () => {
        let page = new PreviewPage('c', 'miscStaticResource');
        await page.open();
        return page.testComponent.then(e => e.shadow$('lightning-card'));
    });
});

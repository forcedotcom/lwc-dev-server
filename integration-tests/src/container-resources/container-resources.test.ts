import http from 'http';
import url from 'url';
import HomePage from '../pageObjects/HomePage';
import PreviewTestComponentPage from '../pageObjects/PreviewTestComponentPage';

// TODO gather and check for all resources in head
describe('Serving container default static resources', () => {
    it('responds with code 200 for the SLDS CSS', async done => {
        await HomePage.open();

        const stylesheet = await browser.$(
            'link[rel="stylesheet"][href*="lightning-design-system"]'
        );

        expect(await stylesheet.isExisting()).toBeTruthy();

        const href = await stylesheet.getAttribute('href');
        const pageUrl = await browser.getUrl();
        const resolvedHref = new url.URL(href, pageUrl).href;

        http.get(resolvedHref, res => {
            expect(res.statusCode).toBe(200);
            done();
        });
    });

    it('responds with code 200 for the utility icon sprite', async done => {
        await PreviewTestComponentPage.open();

        const href = await PreviewTestComponentPage.lightningIconHref;
        const pageUrl = await browser.getUrl();
        const resolvedHref = new url.URL(href, pageUrl).href;

        http.get(resolvedHref, res => {
            expect(res.statusCode).toBe(200);
            done();
        });
    });
});

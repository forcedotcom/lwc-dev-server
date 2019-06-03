import http from 'http';
import url from 'url';

describe('Serving container default static resources', () => {
    it('responds with code 200 for the SLDS CSS', async done => {
        await browser.url(`http://localhost:${global.serverPort}`);

        const stylesheet = await browser.$(
            'link[rel="stylesheet"][href*="lightning-design-system"]'
        );

        expect(await stylesheet.isExisting()).toBeTruthy();

        const pageUrl = await browser.getUrl();
        const href = await stylesheet.getAttribute('href');
        const resolvedHref = new url.URL(href, pageUrl).href;

        http.get(resolvedHref, res => {
            expect(res.statusCode).toBe(200);
            done();
        });
    });

    it('responds with code 200 for the utility icon sprite', async done => {
        await browser.url(
            `http://localhost:${
                global.serverPort
            }/lwc/preview/test/testComponent`
        );

        const element = await browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-preview'))
            .then(el => el.shadow$('test-test-component'))
            .then(el => el.shadow$('lightning-icon'))
            .then(el => el.shadow$('lightning-primitive-icon'))
            .then(el => el.shadow$('use'));

        const pageUrl = await browser.getUrl();
        const href = await element.getAttribute('xlink:href');
        const resolvedHref = new url.URL(href, pageUrl).href;

        http.get(resolvedHref, res => {
            expect(res.statusCode).toBe(200);
            done();
        });
    });
});

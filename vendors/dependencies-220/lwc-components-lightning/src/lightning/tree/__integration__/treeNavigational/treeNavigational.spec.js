const NODE_1 = '[data-key = "1"]';

describe('lightning-tree integration, testing navigational links', () => {
    it('should be able to navigate to other sections of the website when containing navigational links.', () => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(NODE_1).click();
        const currURL = browser.getUrl();
        expect(currURL.indexOf(`${URL}/#sectionOne`) >= 0).to.equal(true);
    });
});

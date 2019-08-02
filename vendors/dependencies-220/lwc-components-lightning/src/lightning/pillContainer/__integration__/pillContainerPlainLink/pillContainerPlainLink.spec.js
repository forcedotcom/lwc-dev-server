const PILL_CONTAINER = 'lightning-pill-container';
const PILL = 'lightning-pill';

describe('pillContainr with plainLink pill', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(PILL_CONTAINER).waitForExist();
    });

    it('should jump to link when hit enter', () => {
        $(PILL).click();
        //browser.keys('Enter');
        // window location should change and match destination value
        browser.waitUntil(() => {
            return browser.getUrl() === 'https://www.google.com/';
        }, 10000);
    });
});

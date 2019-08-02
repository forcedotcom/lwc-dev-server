const ACTIVE_ACCORDION_CLASS = 'slds-accordion__section slds-is-open';

const SECTION_ONE =
    '.slds-accordion__list-item:nth-child(1) > .slds-accordion__section';
const SECTION_TWO =
    '.slds-accordion__list-item:nth-child(2) > .slds-accordion__section';
const SECTION_THREE =
    '.slds-accordion__list-item:nth-child(3) > .slds-accordion__section';

const SECTION_CONTENT = '.slds-accordion__content';

const SECTION_ONE_BUTTON = `${SECTION_ONE} button`;
const SECTION_TWO_BUTTON = `${SECTION_TWO} button`;
const SECTION_THREE_BUTTON = `${SECTION_THREE} button`;

describe('lightning-accordion integration, testing keystrokes', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();
        $('.focus-me-first').click();
    });

    it('should focus on the last section when the up key is pressed on the first section', () => {
        browser.keys('Tab');
        browser.waitUntil(() => {
            return browser.shadowElementHasFocus(`${SECTION_ONE_BUTTON}`);
        });

        browser.keys('ArrowUp');
        browser.keys('Enter');

        $(`${SECTION_THREE} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the last section when the left key is pressed on the first section', () => {
        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('Tab');
        browser.waitUntil(() => {
            return browser.shadowElementHasFocus(`${SECTION_ONE_BUTTON}`);
        });

        browser.keys('ArrowLeft');
        browser.keys('Enter');

        $(`${SECTION_THREE} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the first section when the down key is pressed on the last section', () => {
        $(SECTION_THREE_BUTTON).click();
        $(`${SECTION_THREE} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('ArrowDown');
        browser.keys('Enter');

        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the first section when the right key is pressed on the last section', () => {
        $(SECTION_THREE_BUTTON).click();
        $(`${SECTION_THREE} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('ArrowRight');
        browser.keys('Enter');

        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the previous section if the left key is pressed and the current section is not the first', () => {
        $(SECTION_TWO_BUTTON).click();
        $(`${SECTION_TWO} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('ArrowLeft');
        browser.keys('Enter');

        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the previous section if the up key is pressed and the current section is not the first', () => {
        $(SECTION_TWO_BUTTON).click();
        $(`${SECTION_TWO} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('ArrowUp');
        browser.keys('Enter');

        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the next section if the right key is pressed and the current section is not the last', () => {
        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('Tab');
        browser.waitUntil(() => {
            return browser.shadowElementHasFocus(`${SECTION_ONE_BUTTON}`);
        });

        browser.keys('ArrowRight');
        browser.keys('Enter');

        $(`${SECTION_TWO} ${SECTION_CONTENT}`).waitForDisplayed();
    });

    it('should focus on the next section if the down key is pressed and the current section is not the last', () => {
        $(`${SECTION_ONE} ${SECTION_CONTENT}`).waitForDisplayed();

        browser.keys('Tab');
        browser.waitUntil(() => {
            return browser.shadowElementHasFocus(`${SECTION_ONE_BUTTON}`);
        });

        browser.keys('ArrowDown');
        browser.keys('Enter');

        $(`${SECTION_TWO} ${SECTION_CONTENT}`).waitForDisplayed();
    });
});

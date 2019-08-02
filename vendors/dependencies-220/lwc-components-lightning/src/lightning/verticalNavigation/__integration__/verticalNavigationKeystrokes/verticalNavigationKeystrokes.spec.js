const ACTIVE_ITEM_CLASS = 'slds-is-active';

const FIRST_ITEM = '.item1';
const SECOND_ITEM = '.item2';
const SECTION = '.slds-nav-vertical__section';
const OVERFLOW = '.slds-nav-vertical__overflow > div';

describe('lightning-vertical-navigation, testing key strokes', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $('.focus-me-first').click();
    });
    // tab & enter on navigation items
    it('should tab and select correct item', () => {
        browser.keys('Tab');
        browser.keys('Tab');
        browser.keys('Enter');
        const secondItemClass = $(SECOND_ITEM).getAttribute('class');
        expect(secondItemClass.indexOf(ACTIVE_ITEM_CLASS)).to.be.above(0);
    });
    // tab and enter on overflow
    it('should tab and select overflow on enter', () => {
        browser.keys(Array(3).fill('Tab')); // tab 3 times to focus on overflow
        browser.keys('Enter'); // enter should expand or collapse the overflow
        const overflowClass = $(OVERFLOW).getAttribute('class');
        expect(overflowClass).to.equal('slds-show');
    });
    // tab and space on overflow
    it('should tab and select overflow on space', () => {
        browser.keys(Array(3).fill('Tab')); // tab 3 times to focus on overflow
        browser.keys('Space'); // space should expand or collapse the overflow
        const overflowClass = $(OVERFLOW).getAttribute('class');
        expect(overflowClass).to.equal('slds-show');
    });
    // section does not get tab focus
    it('should tab over section', () => {
        browser.keys('Tab');
        expect(browser.getActiveElement()).to.not.equal($(SECTION));
    });
    // tabbing backwards
    it('should tab backwards', () => {
        browser.keys('Tab');
        browser.keys('Tab');
        browser.keys(['Shift', 'Tab', 'NULL']); // tab forwards twice, backwards once
        browser.keys('Enter');
        const firstItemClass = $(FIRST_ITEM).getAttribute('class');
        expect(firstItemClass.indexOf(ACTIVE_ITEM_CLASS)).to.be.above(0);
    });
});

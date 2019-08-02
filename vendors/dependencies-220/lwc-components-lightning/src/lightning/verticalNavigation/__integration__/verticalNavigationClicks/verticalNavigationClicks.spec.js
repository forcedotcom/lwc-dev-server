const ACTIVE_ITEM_CLASS = 'slds-is-active';

const SECOND_ITEM = '.item2';
const OVERFLOW_BUTTON = '.slds-nav-vertical__overflow > button';
const OVERFLOW_DIV = '.slds-nav-vertical__overflow > div';

describe('lightning-vertical-navigation, testing clicks', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    // click on navigation items
    it('should click on item', () => {
        $(SECOND_ITEM).click();
        const secondItemClass = $(SECOND_ITEM).getAttribute('class');
        expect(secondItemClass.indexOf(ACTIVE_ITEM_CLASS)).to.be.above(0); // second item is active after clicked
    });
    // click on overflow
    it('should expand overflow on click', () => {
        $(OVERFLOW_BUTTON).click();
        const overflowClass = $(OVERFLOW_DIV).getAttribute('class');
        expect(overflowClass).to.equal('slds-show'); // overflow is expanded after click
    });
    // click on overflow twice collapses it again
    it('should collapse overflow on second click', () => {
        $(OVERFLOW_BUTTON).click();
        $(OVERFLOW_BUTTON).click();
        const overflowClass = $(OVERFLOW_DIV).getAttribute('class');
        expect(overflowClass).to.equal('slds-hide');
    });
});

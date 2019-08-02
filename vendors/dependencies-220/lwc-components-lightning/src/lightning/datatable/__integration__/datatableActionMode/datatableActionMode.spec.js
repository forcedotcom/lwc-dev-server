const AGE_HEADER_CLICK = '[aria-label="Age"] span';
const EMAIL_HEADER_CLICK = '[aria-label="Email"] span';
const AGE_BUTTON_MENU =
    '[aria-label="Age"] [class="slds-button slds-button_icon-bare"]';
const AGE_RESIZEABLE =
    '[aria-label="Age"] [class="slds-resizable__input slds-assistive-text"]';
const NAME_RESIZEABLE =
    '[aria-label="Name"] [class="slds-resizable__input slds-assistive-text"]';
const EMAIL_RESIZEABLE =
    '[aria-label="Email"] [class="slds-resizable__input slds-assistive-text"]';
const FIRST_CELL = 'td';

function assertIsFocused(selector) {
    browser.waitUntil(() => browser.shadowElementHasFocus(selector));
}
describe('lightning-datatable, action mode', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should select the previous focusable element in the current cell when the shft+tab key is pressed and the current focusable selected is first.', () => {
        $(AGE_HEADER_CLICK).click();
        browser.keys('Enter');
        assertIsFocused(AGE_BUTTON_MENU);
        browser.keys(['Shift', 'Tab', 'NULL']);
        assertIsFocused(NAME_RESIZEABLE);
    });
    it('should select the next focusable element in the current cell when the tab key is pressed and the current focusable selected is not last.', () => {
        $(AGE_HEADER_CLICK).click();
        browser.keys('Enter');
        assertIsFocused(AGE_BUTTON_MENU);
        browser.keys('Tab');
        assertIsFocused(AGE_RESIZEABLE);
    });
    it('should select the first focusable element of the next row when the tab key is pressed and the current focusable item is the last item in the row', () => {
        $(EMAIL_HEADER_CLICK).click();
        browser.keys('Enter');
        browser.keys('Tab');
        assertIsFocused(EMAIL_RESIZEABLE);
        browser.keys('Tab');
        assertIsFocused(FIRST_CELL);
    });
    it('should select the last focusable element of the previous row when the shift+tab key is pressed and the current focusable item is the first item in the row', function() {
        if (browser.capabilities.browserName === 'internet explorer') {
            this.skip();
            return;
        }
        $(FIRST_CELL).click();
        browser.keys('Enter');
        assertIsFocused(FIRST_CELL);
        browser.keys(['Shift', 'Tab', 'NULL']);
        assertIsFocused(EMAIL_RESIZEABLE);
    });
});

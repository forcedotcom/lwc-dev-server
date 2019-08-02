const MENU_ONE = '.button-menu-1';
const MENU_TWO = '.button-menu-2';
const MENU_FOUR = '.button-menu-4';
const SCROLL_THRESHHOLD = 300;

const selectors = {
    menuTrigger: '.slds-dropdown-trigger',
    menuListContainer: '.slds-dropdown',
};

describe('button-menu: position observer ›', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    describe('scrolling vertically ›', () => {
        it('menu should close when move up beyond threshold', () => {
            $(MENU_ONE).click();
            const dropdownSelector =
                MENU_ONE + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(0, SCROLL_THRESHHOLD * 1.05);
            $(dropdownSelector).waitForDisplayed(750, true);
        });

        it('menu should remain open when move up less than threshold', () => {
            $(MENU_ONE).click();
            const menuSelector = MENU_ONE + ' ' + selectors.menuListContainer;
            $(menuSelector).waitForDisplayed();

            browser.scroll(0, SCROLL_THRESHHOLD / 2);
            $(menuSelector).waitForDisplayed();
        });

        it('menu should close when move down beyond threshold', () => {
            const scrollThreshold = SCROLL_THRESHHOLD;

            $(MENU_ONE).click();
            const dropdownSelector =
                MENU_ONE + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(0, scrollThreshold * 2);
            $(dropdownSelector).waitForDisplayed(750, true);
        });

        it('menu should remain open when move down less than threshold', () => {
            const scrollThreshold = SCROLL_THRESHHOLD;

            $(MENU_ONE).click();
            const dropdownSelector =
                MENU_ONE + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(0, scrollThreshold / 2);
            $(dropdownSelector).waitForDisplayed(750, false);
        });

        it('menu should remain open when move down more than threshold for non-auto position', () => {
            const scrollThreshold = SCROLL_THRESHHOLD;
            const scrollStart = SCROLL_THRESHHOLD * 1.5;

            browser.scroll(0, scrollStart);

            $(MENU_FOUR).click();
            const dropdownSelector =
                MENU_FOUR + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(0, scrollStart - scrollThreshold * 2);
            $(dropdownSelector).waitForDisplayed(750, false);
        });
    });

    describe('scrolling horizontally ›', () => {
        it('menu should close when move left beyond threshold', () => {
            $(MENU_TWO).click();
            const dropdownSelector =
                MENU_TWO + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(SCROLL_THRESHHOLD * 1.05, 0);
            $(dropdownSelector).waitForDisplayed(750, true);
        });

        it('menu should remain open when move left less than threshold', () => {
            $(MENU_TWO).click();
            const menuSelector = MENU_TWO + ' ' + selectors.menuListContainer;
            $(menuSelector).waitForDisplayed();

            browser.scroll(SCROLL_THRESHHOLD / 2, 0);
            $(menuSelector).waitForDisplayed();
        });
        it('menu should remain open when move left more than threshold for non-auto position', () => {
            $(MENU_FOUR).click();
            const menuSelector = MENU_FOUR + ' ' + selectors.menuListContainer;
            $(menuSelector).waitForDisplayed();

            browser.scroll(SCROLL_THRESHHOLD * 1.05, 0);
            $(menuSelector).waitForDisplayed();
        });

        it('menu should close when move right beyond threshold', function() {
            if (browser.capabilities.browserName === 'internet explorer') {
                this.skip();
                return;
            }
            const scrollThreshold = SCROLL_THRESHHOLD;
            const scrollStart = SCROLL_THRESHHOLD * 3;

            browser.scroll(scrollStart, 0);

            $(MENU_ONE).click();
            const dropdownSelector =
                MENU_ONE + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(0, 0);
            $(dropdownSelector).waitForDisplayed(1750, true);
        });

        it('menu should remain open when move right less than threshold', function() {
            if (browser.capabilities.browserName === 'internet explorer') {
                this.skip();
                return;
            }
            const scrollThreshold = SCROLL_THRESHHOLD;
            const scrollStart = SCROLL_THRESHHOLD * 1.5;

            browser.scroll(scrollStart, 0);

            $(MENU_ONE).click();
            const dropdownSelector =
                MENU_ONE + ' ' + selectors.menuListContainer;
            $(dropdownSelector).waitForDisplayed();

            browser.scroll(scrollStart - scrollThreshold / 2, 0);
            $(dropdownSelector).waitForDisplayed(750, false);
        });
    });
});

const selectors = {
    buttonMenuBase: '.button-menu-base',
    buttonMenuLazy: '.button-menu-lazy',
    menuTrigger: '.slds-dropdown-trigger',
    menuListContainer: '.slds-dropdown',
    menuItem: '.slds-dropdown__item',
    clickAwayBtn: '.clickAway',
    alignmentBtn: '.chngAlign',
};

const WAITFORDISPLAYED_TIMEOUT = 1500;
const baseSelector = selectors.buttonMenuBase;
const lazySelector = selectors.buttonMenuLazy;
const menuSubHeader = `${selectors.menuListContainer} lightning-menu-subheader`;
const firstMenuItem = `${selectors.menuItem}:nth-of-type(1)`;
const secondMenuItem = `${selectors.menuItem}:nth-of-type(2)`;

describe('button-menu open close focus behavior', () => {
    describe('open close with default alignment', () => {
        beforeEach(() => {
            const URL = browser.getStaticUrl(__filename);
            browser.url(URL);
            $(`${baseSelector}${selectors.menuTrigger}`).waitForDisplayed();
        });

        it('menu opens when trigger clicked', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
        });

        it('menu closes when clicking outside the menu', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $('h1').click();

            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $('h1').click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });
        it('menu closes on selecting menuitem', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();

            $$(`${baseSelector} ${selectors.menuItem}`)[0].click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();

            $$(`${lazySelector} ${selectors.menuItem}`)[0].click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });
        it('menu closes when focusing on another focusable element', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(selectors.clickAwayBtn).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(selectors.clickAwayBtn).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });

        it('focus is on first menu item when menu is opened', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            // check that first menu item is active element
            $(`${baseSelector} ${selectors.menuItem} a`).isFocused();

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            // check that first menu item is active element
            $(`${lazySelector} ${selectors.menuItem} a`).isFocused();
        });
        it('menu item is focused when hovered over', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${baseSelector} ${selectors.menuItem} a`).isFocused();

            let secondMenuItemAnchorEl = $(
                `${baseSelector} ${secondMenuItem} a`
            );
            $(`${baseSelector} ${secondMenuItem}`).moveTo();
            $(`${baseSelector} ${secondMenuItem} a`).isFocused();

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${lazySelector} ${selectors.menuItem} a`).isFocused();

            secondMenuItemAnchorEl = $(`${lazySelector} ${secondMenuItem} a`);
            $(`${lazySelector} ${secondMenuItem}`).moveTo();
            $(`${lazySelector} ${secondMenuItem} a`).isFocused();
        });
        // test to simulate click on scrollbar inside a short menu
        // because cant modify the height of menu using css in shadow dom of button-menu
        it('menu doesnt close on mousedown on subheader', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${baseSelector} ${menuSubHeader}`).click();

            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(selectors.clickAwayBtn).click();

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${lazySelector} ${menuSubHeader}`).click();

            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
        });
    });

    describe('open close with auto alignment', () => {
        beforeEach(() => {
            const URL = browser.getStaticUrl(__filename);
            browser.url(URL);
            $(`${baseSelector}${selectors.menuTrigger}`).waitForDisplayed();
            $(selectors.alignmentBtn).click();
        });

        it('menu opens when trigger clicked', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
        });

        it('menu closes when clicking outside the menu', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(baseSelector)
                .shadow$(selectors.menuListContainer)
                .waitForDisplayed();
            $('h1').click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });

        it.skip('menu closes when clicking outside the menu when lazy loading', () => {
            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $('h1').click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });

        it('menu closes on selecting menuitem', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();

            $$(`${baseSelector} ${selectors.menuItem}`)[0].click();

            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();

            $$(`${lazySelector} ${selectors.menuItem}`)[0].click();

            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });
        it('menu closes when focusing on another focusable element', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(selectors.clickAwayBtn).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });
        it.skip('menu closes when focusing on another focusable element when lazy loading', () => {
            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(selectors.clickAwayBtn).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed(WAITFORDISPLAYED_TIMEOUT, true);
        });

        it('focus is on first menu item when menu is opened', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            // check that first menu item is active element
            $(`${baseSelector} ${selectors.menuItem} a`).isFocused();

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            // check that first menu item is active element
            $(`${lazySelector} ${selectors.menuItem} a`).isFocused();
        });
        it('menu item is focused when hovered over', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${baseSelector} ${selectors.menuItem} a`).click();

            let secondMenuItemAnchorEl = $(
                `${baseSelector} ${secondMenuItem} a`
            );
            $(`${baseSelector} ${secondMenuItem}`).moveTo();
            $(`${baseSelector} ${secondMenuItem} a`).isFocused();

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${lazySelector} ${selectors.menuItem} a`).isFocused();

            secondMenuItemAnchorEl = $(`${lazySelector} ${secondMenuItem} a`);
            $(`${lazySelector} ${secondMenuItem}`).moveTo();
            $(`${lazySelector} ${secondMenuItem} a`).isFocused();
        });
        // test to simulate click on scrollbar inside a short menu
        // because cant modify the height of menu using css in shadow dom of button-menu
        it('menu doesnt close on mousedown on subheader', () => {
            $(`${baseSelector}${selectors.menuTrigger}`).click();
            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${baseSelector} ${menuSubHeader}`).click();

            $(
                `${baseSelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(selectors.clickAwayBtn).click();

            $(`${lazySelector}${selectors.menuTrigger}`).click();
            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
            $(`${lazySelector} ${menuSubHeader}`).click();

            $(
                `${lazySelector} ${selectors.menuListContainer}`
            ).waitForDisplayed();
        });
    });
});

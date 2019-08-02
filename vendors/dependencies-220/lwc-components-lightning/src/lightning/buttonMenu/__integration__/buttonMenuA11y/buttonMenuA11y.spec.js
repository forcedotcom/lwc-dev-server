const assert = require('assert');

const EXTERNAL_URL = 'https://www.google.com/';

const selectors = {
    buttonMenuBase: '.button-menu-base',
    menuTrigger: '.slds-dropdown-trigger',
    menuListContainer: '.slds-dropdown',
    menuDivider: '[class*=slds-has-divider_]',
    menuSubheader: '.slds-dropdown__header',
    menuItem: '.slds-dropdown__item',
    menuItemIdPrefix: '.menu-item-',
    spinner: '.slds-spinner',
    check: 'svg[data-key=check]',
};

const baseSelector = selectors.buttonMenuBase;
const menuTrigger = `${baseSelector}${selectors.menuTrigger}`;
const menuListContainer = `${baseSelector} ${selectors.menuListContainer}`;
const firstMenuItem = `${selectors.menuItemIdPrefix}1`;
const secondMenuItem = `${selectors.menuItemIdPrefix}2`;
const thirdMenuItem = `${selectors.menuItemIdPrefix}3`;
const spinner = `${baseSelector} ${selectors.spinner}`;

describe('button-menu', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $('.focus-me-first').click();
    });

    describe('keyboard navigation ›', () => {
        it('menu opens when spacebar is used on trigger', () => {
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(`${menuTrigger} button`);
            });

            browser.keys(' ');

            $(menuListContainer).waitForDisplayed();
        });

        it('menu opens when enter key is used on trigger', () => {
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(`${menuTrigger} button`);
            });

            browser.keys('Enter');

            $(menuListContainer).waitForDisplayed();
        });

        it('focus is on first menu item when menu is opened with enter key', () => {
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(`${menuTrigger} button`);
            });

            browser.keys('Enter');

            // check that first menu item is active element
            assert(browser.shadowElementHasFocus(`${firstMenuItem} a`));
        });

        it('focus is on first menu item when menu is opened with spacebar key', () => {
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(`${menuTrigger} button`);
            });

            browser.keys(' ');

            // check that first menu item is active element
            assert(browser.shadowElementHasFocus(`${firstMenuItem} a`));
        });

        describe('down arrow key ›', () => {
            it('menu opens when down arrow key is used on trigger', () => {
                // focus on trigger and press down arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowDown');
                $(menuListContainer).waitForDisplayed();
            });

            it('first menu item is active element when menu is opened', () => {
                // focus on trigger and press down arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowDown');
                $(menuListContainer).waitForDisplayed();

                // check that first menu item is active element
                assert(browser.shadowElementHasFocus(`${firstMenuItem} a`));
            });

            it('second menu item is active element after pressing down arrow once', () => {
                // focus on trigger and press down arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowDown');
                $(menuListContainer).waitForDisplayed();

                browser.keys('ArrowDown');

                // check that second menu item is active element
                assert(browser.shadowElementHasFocus(`${secondMenuItem} a`));
            });

            it('opened menu hides spinner when loading and first menu item is active element', () => {
                browser.setComponentAttribute(baseSelector, 'isLoading', true);

                // focus on trigger and press up arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowDown');
                $(menuListContainer).waitForDisplayed();

                $(spinner).isExisting();

                browser.setComponentAttribute(baseSelector, 'isLoading', false);

                // check that first menu item is active element
                assert(browser.shadowElementHasFocus(`${firstMenuItem} a`));
            });
        });

        describe('up arrow key ›', () => {
            it('menu opens when up arrow key is used on trigger', () => {
                // focus on trigger and press up arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowUp');
                $(menuListContainer).waitForDisplayed();
            });

            it('last menu item is active element when menu is opened', () => {
                // focus on trigger and press up arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowUp');
                $(menuListContainer).waitForDisplayed();

                // check that last menu item is active element
                assert(browser.shadowElementHasFocus(`${thirdMenuItem} a`));
            });

            it('second menu item is active element after pressing up arrow once', () => {
                // focus on trigger and press up arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowUp');
                $(menuListContainer).waitForDisplayed();

                browser.keys('ArrowUp');

                // check that second menu item is active element
                assert(browser.shadowElementHasFocus(`${secondMenuItem} a`));
            });

            it('opened menu hides spinner when loading and last menu item is active element', () => {
                browser.setComponentAttribute(baseSelector, 'isLoading', true);

                // focus on trigger and press up arrow
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowUp');
                $(menuListContainer).waitForDisplayed();

                $(spinner).isExisting();

                browser.setComponentAttribute(baseSelector, 'isLoading', false);

                // check that last menu item is active element
                assert(browser.shadowElementHasFocus(`${thirdMenuItem} a`));
            });
        });

        it('menu closes when escape key is pressed while menu is open', () => {
            // open menu
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();

            browser.keys('Escape');

            // check that menu is closed
            $(menuListContainer).waitForDisplayed(500, true);
        });

        it('menu closes when tab key is pressed while menu is open', () => {
            // open menu
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();

            browser.keys('Tab');

            // check that menu is closed
            $(menuListContainer).waitForDisplayed(500, true);
        });

        describe('selectable menu items ›', () => {
            it('unselected item shows checkmark when selected using enter key', () => {
                // focus on trigger and press enter
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('Enter');
                $(menuListContainer).waitForDisplayed();

                browser.keys('ArrowDown');

                browser.waitUntil(() => {
                    // check that second menu item is active element
                    return browser.shadowElementHasFocus(`${secondMenuItem} a`);
                });

                browser.keys('Enter');

                // item should be checked (SVG should not have opacity 0)
                browser.waitUntil(() => {
                    return (
                        $(
                            `${secondMenuItem} ${selectors.check}`
                        ).getCSSProperty('opacity').parsed.value !== 0
                    );
                });
            });

            it('unselected item shows checkmark when selected using spacebar key', () => {
                // focus on trigger and press enter
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('Enter');
                $(menuListContainer).waitForDisplayed();

                browser.keys('ArrowDown');

                browser.waitUntil(() => {
                    // check that second menu item is active element
                    return browser.shadowElementHasFocus(`${secondMenuItem} a`);
                });

                browser.keys('\uE00D'); // space

                browser.waitUntil(() => {
                    // item should be checked (SVG should not have opacity 0)
                    return (
                        $(
                            `${secondMenuItem} ${selectors.check}`
                        ).getCSSProperty('opacity').parsed.value !== 0
                    );
                });
            });

            it('selected item hides checkmark when deselected using enter key', () => {
                // focus on trigger and press enter
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('Enter');
                $(menuListContainer).waitForDisplayed();

                browser.waitUntil(() => {
                    // check that first menu item is active element
                    return browser.shadowElementHasFocus(`${firstMenuItem} a`);
                });

                browser.keys('Enter');

                browser.waitUntil(() => {
                    // item should not be checked (SVG should have opacity 0)
                    return (
                        $(`${firstMenuItem} ${selectors.check}`).getCSSProperty(
                            'opacity'
                        ).parsed.value === 0
                    );
                });
            });

            it('selected item hides checkmark when deselected using spacebar key', () => {
                // focus on trigger and press enter
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('Enter');
                $(menuListContainer).waitForDisplayed();

                browser.waitUntil(() => {
                    // check that first menu item is active element
                    return browser.shadowElementHasFocus(`${firstMenuItem} a`);
                });

                browser.keys(' ');

                browser.waitUntil(() => {
                    // item should not be checked (SVG should have opacity 0)
                    return (
                        $(`${firstMenuItem} ${selectors.check}`).getCSSProperty(
                            'opacity'
                        ).parsed.value === 0
                    );
                });
            });
        });

        describe('menu item with HREF ›', () => {
            it('navigate to HREF location when enter key pressed', () => {
                // focus on trigger and press enter
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowUp');
                $(menuListContainer).waitForDisplayed();

                browser.waitUntil(() => {
                    // check that third menu item is active element
                    return browser.shadowElementHasFocus(`${thirdMenuItem} a`);
                });

                browser.keys('Enter');

                // window location should change and match destination value
                browser.waitUntil(() => {
                    return browser.getUrl() === EXTERNAL_URL;
                });
            });

            it('navigate to HREF location when spacebar key pressed', () => {
                // focus on trigger and press enter
                browser.keys('Tab');

                browser.waitUntil(() => {
                    return browser.shadowElementHasFocus(
                        `${menuTrigger} button`
                    );
                });

                browser.keys('ArrowUp');
                $(menuListContainer).waitForDisplayed();

                browser.waitUntil(() => {
                    // check that third menu item is active element
                    return browser.shadowElementHasFocus(`${thirdMenuItem} a`);
                });

                browser.keys(' ');

                // window location should change and match destination value
                browser.waitUntil(() => {
                    return browser.getUrl() === EXTERNAL_URL;
                });
            });
        });
    });
});

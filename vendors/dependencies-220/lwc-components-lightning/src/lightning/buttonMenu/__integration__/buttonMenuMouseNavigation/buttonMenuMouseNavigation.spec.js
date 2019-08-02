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
const subheaderItem = `${baseSelector} ${selectors.menuSubheader}`;
const firstMenuItem = `${selectors.menuItemIdPrefix}1`;
const secondMenuItem = `${selectors.menuItemIdPrefix}2`;
const thirdMenuItem = `${selectors.menuItemIdPrefix}3`;
const spinner = `${baseSelector} ${selectors.spinner}`;

describe('button-menu', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    describe('mouse navigation ›', () => {
        it('menu opens when trigger clicked', () => {
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();
        });

        it('menu closes when clicking outside the menu', () => {
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();

            $('body').click();
            $(menuListContainer).waitForDisplayed(500, true);
        });

        it('focus is on first menu item when menu is opened', () => {
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();

            // check that first menu item is active element
            $(`${firstMenuItem} a`).isFocused();
        });

        it('menu item highlights when hovered over', () => {
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();

            const secondMenuItemAnchorEl = $(`${secondMenuItem} a`);
            const menuItemInitialBackgroundColor = secondMenuItemAnchorEl.getCSSProperty(
                'background-color'
            ).parsed.hex;

            $(secondMenuItem).moveTo();
            // background color should be different when hovered
            assert(
                secondMenuItemAnchorEl.getCSSProperty('background-color').parsed
                    .hex !== menuItemInitialBackgroundColor
            );
        });

        it('menu subheader does not highlight when hovered over', () => {
            $(menuTrigger).click();
            $(menuListContainer).waitForDisplayed();

            const subheaderItemSpanEl = $(`${subheaderItem} span`);
            const subheaderInitialBackgroundColor = subheaderItemSpanEl.getCSSProperty(
                'background-color'
            ).parsed.hex;

            $(subheaderItem).moveTo();
            // background color should be the same when hovered
            assert(
                subheaderItemSpanEl.getCSSProperty('background-color').parsed
                    .hex === subheaderInitialBackgroundColor
            );
        });

        describe('loading ›', () => {
            it('opened menu shows spinner when in loading state', () => {
                browser.setComponentAttribute(baseSelector, 'isLoading', true);

                $(menuTrigger).click();
                $(menuListContainer).waitForDisplayed();

                $(spinner).isExisting();
            });

            it('opened menu hides spinner when loading state changes from true to false', () => {
                browser.setComponentAttribute(baseSelector, 'isLoading', true);

                $(menuTrigger).click();
                $(menuListContainer).waitForDisplayed();

                $(spinner).waitForExist();

                browser.setComponentAttribute(baseSelector, 'isLoading', false);
                try {
                    $(spinner).waitForExist(500, true);
                } catch (e) {
                    // IE11 Driver 2.53.1 will throw exception
                }
            });

            it('opened menu hides spinner when loading and focus is on first menu item', () => {
                browser.setComponentAttribute(baseSelector, 'isLoading', true);

                $(menuTrigger).click();
                $(menuListContainer).waitForDisplayed();

                $(spinner).isExisting();

                browser.setComponentAttribute(baseSelector, 'isLoading', false);

                // check that first menu item is active element
                $(`${firstMenuItem} a`).isFocused();
            });
        });

        describe('selectable menu items ›', () => {
            it('unselected item shows checkmark when selected', () => {
                $(menuTrigger).click();
                $(menuListContainer).waitForDisplayed();

                $(secondMenuItem).click();

                // item should be checked (SVG should not have opacity 0)
                assert(
                    $(`${secondMenuItem} ${selectors.check}`).getCSSProperty(
                        'opacity'
                    ).parsed.value !== 0
                );
            });

            it('selected item hides checkmark when deselected', () => {
                $(menuTrigger).click();
                $(menuListContainer).waitForDisplayed();

                $(firstMenuItem).click();

                // item should not be checked (SVG should have opacity 0)
                assert(
                    $(`${firstMenuItem} ${selectors.check}`).getCSSProperty(
                        'opacity'
                    ).parsed.value === 0
                );
            });
        });

        describe('menu item with HREF ›', () => {
            it('navigate to HREF location when clicked', () => {
                $(menuTrigger).click();
                $(menuListContainer).waitForDisplayed();

                $(thirdMenuItem).click();

                // window location should change and match destination value
                browser.waitUntil(() => {
                    return browser.getUrl() === EXTERNAL_URL;
                });
            });
        });
    });
});

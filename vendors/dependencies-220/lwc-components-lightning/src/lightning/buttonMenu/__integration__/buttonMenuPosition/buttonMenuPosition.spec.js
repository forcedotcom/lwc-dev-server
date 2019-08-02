const MENU_ONE = '.btn-menu1';
const MENU_TWO = '.btn-menu2';
const MENU_THREE = '.btn-menu3';
const MENU_FOUR = '.btn-menu4';
const MENU_OHIDDEN = '.btn-menuhidden';
const MENU_BUTTON = ' button';
const MENU_DROPDOWN = ' div.slds-dropdown';

describe('button-menu dropdown is visible', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    describe('button-menu dropdown shows unclipped by viewport', () => {
        it('when it is on top-left edge of the viewport', () => {
            const btnSel = `${MENU_ONE}${MENU_BUTTON}`;
            const menuSel = `${MENU_ONE}${MENU_DROPDOWN}`;
            $(btnSel).click();
            $(menuSel).waitForDisplayed();
        });
        it('when it is on top-right edge of the viewport', () => {
            const btnSel = `${MENU_TWO}${MENU_BUTTON}`;
            const menuSel = `${MENU_TWO}${MENU_DROPDOWN}`;
            const btnLeft = $(btnSel).getLocation('x');
            $(btnSel).click();
            $(menuSel).waitForDisplayed();
            const menuLeft = $(menuSel).getLocation('x');
            expect(menuLeft < btnLeft).to.equal(true);
        });
        it('when it is on bottom-left edge of the viewport', () => {
            const btnSel = `${MENU_THREE}${MENU_BUTTON}`;
            const menuSel = `${MENU_THREE}${MENU_DROPDOWN}`;
            $(btnSel).click();
            browser.keys('Escape');
            browser.keys('Enter');
            $(menuSel).waitForDisplayed();
            const btnTop = $(btnSel).getLocation('y');
            const menuTop = $(menuSel).getLocation('y');
            expect(menuTop < btnTop).to.equal(true);
        });
        // TODO: W-6004465 flapper test
        it.skip('when it is on bottom-right edge of the viewport', () => {
            const btnSel = `${MENU_FOUR}${MENU_BUTTON}`;
            const menuSel = `${MENU_FOUR}${MENU_DROPDOWN}`;
            const btnTop = $(btnSel).getLocation('y');
            $(btnSel).click();
            $(menuSel).waitForDisplayed();
            const menuTop = $(menuSel).getLocation('y');
            expect(menuTop < btnTop).to.equal(true);
        });
        it('when it is in div with overflow hidden', () => {
            const btnSel = `${MENU_OHIDDEN}${MENU_BUTTON}`;
            $(btnSel).waitForDisplayed();
            const menuSel = `${MENU_OHIDDEN}${MENU_DROPDOWN}`;
            $('.focus-me-first').click();
            browser.keys('Tab');
            browser.keys('Tab');
            browser.keys('ArrowDown');
            $(menuSel).waitForDisplayed();
        });
    });
});

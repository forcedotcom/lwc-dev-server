const selectors = {
    renderTabsetButton: '.renderTabsetButton',
    activeValue: '.activeValue',
    tabsToHide: '.tabsToHide',
    tabValueToChange: '.changeTabValue',
    defaultTabset: '.default_tabset',
    tab: '[role="tablist"] [data-tab]',
    tabBody: '[role="tabpanel"]',
};

const ACTIVE_TAB_CLASS = 'slds-is-active';
const SHOWING_TAB_CONTENT_CLASS = 'slds-show';

const ARIA_SELECTED = 'aria-selected';

function isTabSelected(tab) {
    const tabAnchor = tab.$('a');
    const tabAriaSelected = tabAnchor.getAttribute(ARIA_SELECTED);
    const tabTabIndex = tabAnchor.getAttribute('tabindex');
    const tabLiClass = tab.getAttribute('class').split(' ');

    return (
        tabAriaSelected === 'true' &&
        tabTabIndex === '0' &&
        tabLiClass.includes(ACTIVE_TAB_CLASS)
    );
}

function isTabContentDisplayed(tab) {
    const lightningTabClass = tab.getAttribute('class').split(' ');
    return (
        lightningTabClass.includes(SHOWING_TAB_CONTENT_CLASS) &&
        tab.getText().length > 0
    );
}

function expectTabSelected(selectedTabIndex) {
    const tabHeaders = $(selectors.defaultTabset).shadow$$(selectors.tab);
    tabHeaders.forEach((tab, index) => {
        expect(isTabSelected(tab)).to.equal(selectedTabIndex === index);
    });

    const tabs = $(selectors.defaultTabset).shadow$$(selectors.tabBody);
    tabs.forEach((tab, index) => {
        expect(isTabContentDisplayed(tab)).to.equal(selectedTabIndex === index);
    });
}

describe('Tabset with active tab Value', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    const renderTabset = function() {
        $(selectors.renderTabsetButton).click();
    };

    const selectTabWithValue = function(value) {
        const activeValue = $(selectors.activeValue);
        activeValue.$('input').setValue(value);
        activeValue.$('button').click();
    };

    const changeValueOfTab = function(value) {
        const tabValueToChange = $(selectors.tabValueToChange);
        tabValueToChange.$('input').setValue(value);
        tabValueToChange.$('button').click();
    };

    const hideTabAndWait = function(value) {
        const currentTabs = $$(`${selectors.defaultTabset} ${selectors.tab}`);

        const tabsToHideControl = $(selectors.tabsToHide);
        tabsToHideControl.$('input').setValue(value);
        tabsToHideControl.$('button').click();

        browser.waitUntil(() => {
            const found = $$(`${selectors.defaultTabset} ${selectors.tab}`);
            return found.length !== currentTabs.length;
        });
    };

    it('should default to the first tab when no value specified', () => {
        renderTabset();

        expectTabSelected(0);
    });

    it('should select the correct tab when an active tab value is specified on first render', () => {
        selectTabWithValue(2);

        renderTabset();

        expectTabSelected(2);
    });

    it('should select the specified tab', () => {
        renderTabset();

        selectTabWithValue(2);

        expectTabSelected(2);
    });

    it('should change tab when new tab selected', () => {
        renderTabset();

        selectTabWithValue(2);
        selectTabWithValue(1);

        expectTabSelected(1);
    });

    it('should select tab when clicking on new tab', () => {
        renderTabset();

        selectTabWithValue(2);

        const tabs = $$(`${selectors.defaultTabset} ${selectors.tab}`);
        const targetTab = tabs[1].$('a');
        targetTab.click();

        expectTabSelected(1);
    });

    it('should select the first tab when selected tab is deregistered', () => {
        renderTabset();

        selectTabWithValue(2);
        hideTabAndWait(2);

        expectTabSelected(0);
    });

    it('should select the tab with new value after tab value changes', function() {
        if (browser.capabilities.browserName === 'internet explorer') {
            this.skip();
            return;
        }
        renderTabset();

        selectTabWithValue(1);

        changeValueOfTab(2);
        expectTabSelected(1);

        selectTabWithValue(2);

        // no tab with value=2, so the first tab should remain selected
        expectTabSelected(1);

        selectTabWithValue(20);
        // The tab with index=2 has value 20 instead of 2 now
        expectTabSelected(2);
    });
});

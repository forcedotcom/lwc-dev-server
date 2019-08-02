const selectors = {
    numOfTabs: '.numOfTabs',
    tabsToHide: '.tabsToHide',
    labelPrefix: '.labelPrefix',
    defaultTabset: '.default_tabset',
    scopedTabset: '.scoped_tabset',
    tabBar: '[role="tablist"]',
    tab: '[role="tablist"] [data-tab]',
    overflowMenu: '[role="menu"]',
    overflowTab: '[role="menu"] [role="presentation"]',
    overflowButton: '[data-overflow]',
};

const VIEWPORT_SIZE_WITH_OVERFLOW = { width: 1000, height: 500 };
const VIEWPORT_SIZE_WITHOUT_OVERFLOW = { width: 2000, height: 500 };

function getElementRect(element) {
    const size = element.getSize();
    const location = element.getLocation();

    return {
        ...size,
        left: location.x,
        right: location.x + size.width,
        top: location.y,
        bottom: location.y + size.height,
    };
}

function setViewportSize(rect) {
    browser.setWindowSize(rect.width || 800, rect.height || 600);
}

describe('Tabset Overflow', () => {
    [
        {
            variant: 'Default',
            tabsetSelector: selectors.defaultTabset,
        },
        {
            variant: 'Scoped',
            tabsetSelector: selectors.scopedTabset,
        },
    ].forEach(({ variant, tabsetSelector }) => {
        const openOverflowDropdown = function() {
            const moreButton = $(
                `${tabsetSelector} ${selectors.overflowButton}`
            );
            moreButton.click();
            $(selectors.overflowMenu).waitForDisplayed();
        };

        const waitForOverflowButtonToShow = function() {
            $(
                `${tabsetSelector} ${selectors.overflowButton}`
            ).waitForDisplayed();
        };

        const waitForOverflowButtonToHide = function() {
            $(`${tabsetSelector} ${selectors.overflowButton}`).waitForDisplayed(
                1000,
                true
            );
        };

        const resizeToShowOverflow = function() {
            setViewportSize(VIEWPORT_SIZE_WITH_OVERFLOW);
            waitForOverflowButtonToShow();
        };

        const resizeToHideOverflow = function() {
            setViewportSize(VIEWPORT_SIZE_WITHOUT_OVERFLOW);
            waitForOverflowButtonToHide();
        };

        describe(`${variant} Tabset`, () => {
            beforeEach(() => {
                const URL = browser.getStaticUrl(__filename);
                browser.url(URL);
            });

            describe('overflow calculation', () => {
                describe('resizing container', () => {
                    describe('when all tabs fit the tab-bar and overflow button is hidden', () => {
                        beforeEach(() => {
                            resizeToHideOverflow();
                        });

                        it('last tab should not exceed the right edge of the tab bar', () => {
                            const tabs = $$(
                                `${tabsetSelector} ${selectors.tab}`
                            );
                            const [lastTab] = tabs.slice(-1);
                            const lastTabRect = getElementRect(lastTab);
                            const tabBar = $(
                                `${tabsetSelector} ${selectors.tabBar}`
                            );
                            const tabBarRect = getElementRect(tabBar);

                            expect(lastTabRect.right).to.be.lessThan(
                                tabBarRect.right
                            );
                        });
                    });

                    describe('when all tabs do not fit the tab-bar and overflow button is shown', () => {
                        beforeEach(() => {
                            resizeToShowOverflow();
                        });

                        it('overflow button should fit inside the tab-bar', () => {
                            const tabset = $(tabsetSelector);
                            const tabBarRect = getElementRect(
                                $(`${tabsetSelector} ${selectors.tabBar}`)
                            );
                            const moreButtonRect = getElementRect(
                                $(
                                    `${tabsetSelector} ${
                                        selectors.overflowButton
                                    }`
                                )
                            );

                            expect(moreButtonRect.right).to.be.most(
                                tabBarRect.right
                            );
                        });

                        it('an additional tab to the right of overflow button should not fit the tab-bar', () => {
                            const tabset = $(tabsetSelector);
                            const tabRect = getElementRect(
                                $(`${tabsetSelector} ${selectors.tab}`)
                            );
                            const tabBarRect = getElementRect(
                                $(`${tabsetSelector} ${selectors.tabBar}`)
                            );
                            const moreButtonRect = getElementRect(
                                $(
                                    `${tabsetSelector} ${
                                        selectors.overflowButton
                                    }`
                                )
                            );

                            expect(
                                moreButtonRect.right + tabRect.width
                            ).to.be.greaterThan(tabBarRect.right);
                        });

                        it('should not close the overflow menu immediately when the overflow button is clicked', () => {
                            const numOfTabControl = $(selectors.numOfTabs);
                            numOfTabControl.$('input').setValue('50');
                            numOfTabControl.$('button').click();

                            waitForOverflowButtonToShow();

                            const moreButton = $(
                                `${tabsetSelector} ${selectors.overflowButton}`
                            );
                            moreButton.click();
                            $(selectors.overflowMenu).waitForDisplayed();
                        });
                    });
                });

                describe('updating labels', () => {
                    it('should show overflow button when label becomes longer', () => {
                        resizeToHideOverflow();
                        const labelPrefixControl = $(selectors.labelPrefix);
                        labelPrefixControl
                            .$('input')
                            .setValue('Super long long long long label');
                        labelPrefixControl.$('button').click();

                        waitForOverflowButtonToShow();
                    });

                    it('should hide overflow button when label becomes shorter', () => {
                        resizeToShowOverflow();
                        const labelPrefixControl = $(selectors.labelPrefix);
                        labelPrefixControl.$('input').clearValue();
                        labelPrefixControl.$('button').click();

                        waitForOverflowButtonToHide();
                    });
                });

                describe('modifying tabs', () => {
                    it('should show overflow button when tabs are added', () => {
                        const numOfTabControl = $(selectors.numOfTabs);
                        numOfTabControl.$('input').setValue('20');
                        numOfTabControl.$('button').click();

                        waitForOverflowButtonToShow();
                    });

                    it('should hide overflow button when tabs are removed', () => {
                        resizeToShowOverflow();

                        const tabsToHideControl = $(selectors.tabsToHide);
                        tabsToHideControl.$('input').setValue('3,4,5,6,7');
                        tabsToHideControl.$('button').click();

                        waitForOverflowButtonToHide();
                    });
                });
            });

            it.skip('focus should move between overflow button and active tab using tab/shift-tab key', () => {
                resizeToShowOverflow();

                const targetTab = $$(`${tabsetSelector} ${selectors.tab}`)[1].$(
                    'a'
                );
                const overflowButton = $(
                    `${tabsetSelector} ${selectors.overflowButton} button`
                );

                targetTab.click();
                expect(browser.shadowElementHasFocus(targetTab)).to.be.true;

                browser.keys('Tab');
                expect(browser.shadowElementHasFocus(overflowButton)).to.be
                    .true;

                // need 'NULL' at the end to release the Shift key
                browser.keys(['Shift', 'Tab', 'NULL']);
                expect(browser.shadowElementHasFocus(targetTab)).to.be.true;
            });

            it.skip('should swap out the last tab when select a tab from overflow menu', () => {
                resizeToShowOverflow();

                openOverflowDropdown();

                let [lastTab] = $$(`${tabsetSelector} ${selectors.tab}`).slice(
                    -1
                );
                let firstOverflowTab = $(
                    `${tabsetSelector} ${selectors.overflowTab}`
                );

                const prevLastTabLabel = lastTab.getText();
                const prevFirstOverflowTabLabel = firstOverflowTab.getText();
                firstOverflowTab.click();

                // open the menu again so that we can get the new overflow item
                openOverflowDropdown();

                [lastTab] = $$(`${tabsetSelector} ${selectors.tab}`).slice(-1);
                firstOverflowTab = $(
                    `${tabsetSelector} ${selectors.overflowTab}`
                );

                expect(lastTab.getText()).to.equal(prevFirstOverflowTabLabel);
                expect(firstOverflowTab.getText()).to.equal(prevLastTabLabel);
            });
        });
    });
});

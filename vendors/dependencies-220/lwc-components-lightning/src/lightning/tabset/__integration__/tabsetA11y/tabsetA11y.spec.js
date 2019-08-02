const SELECTOR_COMPONENT_DEFAULT = `.default_tabset`;
const SELECTOR_COMPONENT_SCOPED = `.scoped_tabset`;
const SELECTOR_COMPONENT_VERTICAL = `.vertical_tabset`;

const SELECTOR_DEFAULT_TABS = `${SELECTOR_COMPONENT_DEFAULT} .slds-tabs_default__item:not(.slds-tabs_default__overflow-button)`;
const SELECTOR_SCOPED_TABS = `${SELECTOR_COMPONENT_SCOPED} .slds-tabs_scoped__item:not(.slds-tabs_scoped__overflow-button)`;
const SELECTOR_VERTICAL_TABS = `${SELECTOR_COMPONENT_VERTICAL} .slds-vertical-tabs__nav-item:not(.slds-vertical-tabs__overflow-button)`;

const SELECTOR_DEFAULT_TABS_NTH_LINK = `${SELECTOR_COMPONENT_DEFAULT} .slds-tabs_default__item:nth-child(::index::) .slds-tabs_default__link`;
const SELECTOR_SCOPED_TABS_NTH_LINK = `${SELECTOR_COMPONENT_SCOPED} .slds-tabs_scoped__item:nth-child(::index::) .slds-tabs_scoped__link`;
const SELECTOR_VERTICAL_TABS_NTH_LINK = `${SELECTOR_COMPONENT_VERTICAL} .slds-vertical-tabs__nav-item:nth-child(::index::) .slds-vertical-tabs__link`;

const KEYS_HORIZONTAL_NEXT = `ArrowRight`;
const KEYS_VERTICAL_NEXT = `ArrowDown`;
const KEYS_HORIZONTAL_PREVIOUS = `ArrowLeft`;
const KEYS_VERTICAL_PREVIOUS = 'ArrowUp';

//
// tests use custom WDIO command `shadowElementHasFocus`
// :: see `/wdio-custom-commands` directory for source code
//

describe('Tabset accessibility ›', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    describe(`Default Tabset ›`, () => {
        it('should select the tab when a tab is clicked', () => {
            const tabs = $$(SELECTOR_DEFAULT_TABS);
            const targetTabIndex = 1;

            tabs[targetTabIndex].click();

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_DEFAULT_TABS_NTH_LINK.replace(
                        '::index::',
                        targetTabIndex + 1
                    )
                );
            });
        });

        it(`should move to the next tab when ${KEYS_HORIZONTAL_NEXT} key is pressed`, () => {
            const tabs = $$(SELECTOR_DEFAULT_TABS);
            const secondTab = 1;

            tabs[secondTab].click();
            browser.keys(KEYS_HORIZONTAL_NEXT);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_DEFAULT_TABS_NTH_LINK.replace(
                        '::index::',
                        secondTab + 2
                    )
                );
            });
        });

        it(`should move to the previous tab when ${KEYS_HORIZONTAL_PREVIOUS} key is pressed`, () => {
            const tabs = $$(SELECTOR_DEFAULT_TABS);
            const secondTab = 1;

            tabs[secondTab].click();
            browser.keys(KEYS_HORIZONTAL_PREVIOUS);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_DEFAULT_TABS_NTH_LINK.replace(
                        '::index::',
                        secondTab
                    )
                );
            });
        });

        it(`should move to the first tab when ${KEYS_HORIZONTAL_NEXT} key is pressed at the last tab`, () => {
            const tabs = $$(SELECTOR_DEFAULT_TABS);
            const firstTab = 0;
            const lastTab = tabs.length - 1;

            tabs[lastTab].click();
            browser.keys(KEYS_HORIZONTAL_NEXT);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_DEFAULT_TABS_NTH_LINK.replace('::index::', 1)
                );
            });
        });

        it(`should move to the last tab when ${KEYS_HORIZONTAL_PREVIOUS} key is pressed at the first tab`, () => {
            const tabs = $$(SELECTOR_DEFAULT_TABS);
            const firstTab = 0;
            const lastTab = tabs.length - 1;

            tabs[firstTab].click();
            browser.keys(KEYS_HORIZONTAL_PREVIOUS);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_DEFAULT_TABS_NTH_LINK.replace(
                        '::index::',
                        lastTab + 1
                    )
                );
            });
        });
    });

    describe(`Scoped Tabset ›`, () => {
        it('should select the tab when a tab is clicked', () => {
            const tabs = $$(SELECTOR_SCOPED_TABS);
            const targetTabIndex = 1;

            tabs[targetTabIndex].click();

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_SCOPED_TABS_NTH_LINK.replace(
                        '::index::',
                        targetTabIndex + 1
                    )
                );
            });
        });

        it(`should move to the next tab when ${KEYS_HORIZONTAL_NEXT} key is pressed`, () => {
            const tabs = $$(SELECTOR_SCOPED_TABS);
            const secondTab = 1;

            tabs[secondTab].click();
            browser.keys(KEYS_HORIZONTAL_NEXT);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_SCOPED_TABS_NTH_LINK.replace(
                        '::index::',
                        secondTab + 2
                    )
                );
            });
        });

        it(`should move to the previous tab when ${KEYS_HORIZONTAL_PREVIOUS} key is pressed`, () => {
            const tabs = $$(SELECTOR_SCOPED_TABS);
            const secondTab = 1;

            tabs[secondTab].click();
            browser.keys(KEYS_HORIZONTAL_PREVIOUS);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_SCOPED_TABS_NTH_LINK.replace(
                        '::index::',
                        secondTab
                    )
                );
            });
        });

        it(`should move to the first tab when ${KEYS_HORIZONTAL_NEXT} key is pressed at the last tab`, () => {
            const tabs = $$(SELECTOR_SCOPED_TABS);
            const firstTab = 0;
            const lastTab = tabs.length - 1;

            tabs[lastTab].click();
            browser.keys(KEYS_HORIZONTAL_NEXT);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_SCOPED_TABS_NTH_LINK.replace('::index::', 1)
                );
            });
        });

        it(`should move to the last tab when ${KEYS_HORIZONTAL_PREVIOUS} key is pressed at the first tab`, () => {
            const tabs = $$(SELECTOR_SCOPED_TABS);
            const firstTab = 0;
            const lastTab = tabs.length - 1;

            tabs[firstTab].click();
            browser.keys(KEYS_HORIZONTAL_PREVIOUS);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_SCOPED_TABS_NTH_LINK.replace(
                        '::index::',
                        lastTab + 1
                    )
                );
            });
        });
    });

    describe(`Vertical Tabset ›`, () => {
        it('should select the tab when a tab is clicked', () => {
            const tabs = $$(SELECTOR_VERTICAL_TABS);
            const targetTabIndex = 1;

            tabs[targetTabIndex].click();

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_VERTICAL_TABS_NTH_LINK.replace(
                        '::index::',
                        targetTabIndex + 1
                    )
                );
            });
        });

        it(`should move to the next tab when ${KEYS_VERTICAL_NEXT} key is pressed`, () => {
            const tabs = $$(SELECTOR_VERTICAL_TABS);
            const secondTab = 1;

            tabs[secondTab].click();
            browser.keys(KEYS_VERTICAL_NEXT);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_VERTICAL_TABS_NTH_LINK.replace(
                        '::index::',
                        secondTab + 2
                    )
                );
            });
        });

        it(`should move to the previous tab when ${KEYS_VERTICAL_PREVIOUS} key is pressed`, () => {
            const tabs = $$(SELECTOR_VERTICAL_TABS);
            const secondTab = 1;

            tabs[secondTab].click();
            browser.keys(KEYS_VERTICAL_PREVIOUS);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_VERTICAL_TABS_NTH_LINK.replace(
                        '::index::',
                        secondTab
                    )
                );
            });
        });

        it(`should move to the first tab when ${KEYS_VERTICAL_NEXT} key is pressed at the last tab`, () => {
            const tabs = $$(SELECTOR_VERTICAL_TABS);
            const firstTab = 0;
            const lastTab = tabs.length - 1;

            tabs[lastTab].click();
            browser.keys(KEYS_VERTICAL_NEXT);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_VERTICAL_TABS_NTH_LINK.replace('::index::', 1)
                );
            });
        });

        it(`should move to the last tab when ${KEYS_VERTICAL_PREVIOUS} key is pressed at the first tab`, () => {
            const tabs = $$(SELECTOR_VERTICAL_TABS);
            const firstTab = 0;
            const lastTab = tabs.length - 1;

            tabs[firstTab].click();
            browser.keys(KEYS_VERTICAL_PREVIOUS);

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    SELECTOR_VERTICAL_TABS_NTH_LINK.replace(
                        '::index::',
                        lastTab + 1
                    )
                );
            });
        });
    });
});

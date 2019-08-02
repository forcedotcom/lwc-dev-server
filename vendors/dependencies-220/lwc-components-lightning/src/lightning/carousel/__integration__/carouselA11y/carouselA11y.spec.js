const selectors = {
    autoplayButton: '.slds-carousel__autoplay .slds-button',
    activePanelLink: '.slds-carousel__panel-action[tabindex="0"]',
    activeIndicator:
        '.slds-carousel__indicator-action.slds-is-active[tabindex="0"]',
};

describe('carousel', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $('.focus-me-first').waitForDisplayed();
        $('.focus-me-first').click();
    });

    describe('keyboard navigation ›', () => {
        it('pressing tab follows proper path: autoplay button, active panel link, active indicator', () => {
            // first tab press
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(selectors.autoplayButton);
            });

            // Disable autoplay, IE11 it could be slow, then there is chance, the slide is gone, which has focus.
            // Since we verify the focus, don't require the autoplay.
            $(selectors.autoplayButton).click();

            // second tab press
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(selectors.activePanelLink);
            });

            // third tab press
            browser.keys('Tab');

            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(selectors.activeIndicator);
            });
        });

        // it('pressing right arrow when focused on active indicator moves to next panel (first to second)', () => {
        //     // focus on indicator
        //     $(selectors.activeIndicator).click();

        //     browser.waitUntil(() => {
        //         return browser.hasFocus(`${selectors.activeIndicator}`);
        //     });

        //     browser.keys("ArrowRight");

        //     browser.waitUntil(() => {
        //         return browser.hasFocus(`${selectors.activeIndicator}[aria-selected="true"]`);
        //     });

        //     //browser.waitForVisible(`#content-id-02`);
        // });

        // it('pressing left arrow when focused on active indicator moves to previous panel (first to third)', () => {
        //     // focus on indicator
        //     $(selectors.activeIndicator).click();

        //     browser.waitUntil(() => {
        //         return browser.hasFocus(`${selectors.activeIndicator}`);
        //     });

        //     browser.keys("ArrowLeft");

        //     browser.waitUntil(() => {
        //         return browser.hasFocus(`${selectors.activeIndicator}[id="indicator-id-03"]`);
        //     });

        //     browser.waitForVisible(`#content-id-03`);
        // });

        describe('with `disable-auto-refresh` set to "true" ›', () => {
            // SKIPPED REASON: issue with disableAutoRefresh not being set as expected when in this testing envrionment
            it.skip('pressing left arrow when focused on first indicator does nothing', () => {
                // set disable-auto-refresh
                browser.setComponentAttribute(
                    '.carousel',
                    'disableAutoRefresh',
                    true
                );

                // focus on indicator
                $(selectors.activeIndicator).click();

                browser.waitUntil(() => {
                    return $(`${selectors.activeIndicator}`).isFocused();
                });

                browser.keys('ArrowLeft');

                // should remain on first indicator & panel
                browser.waitUntil(() => {
                    return $(
                        `${selectors.activeIndicator}[id="indicator-id-01"]`
                    ).isFocused();
                });

                $(`#content-id-01`).waitForDisplayed();
            });

            // SKIPPED REASON: issue with disableAutoRefresh not being set as expected when in this testing envrionment
            it.skip('pressing right arrow when focused on last indicator does nothing', () => {
                // set disable-auto-refresh
                browser.setComponentAttribute(
                    '.carousel',
                    'disableAutoRefresh',
                    true
                );

                // focus on indicator
                $(selectors.activeIndicator).click();

                browser.waitUntil(() => {
                    return $(`${selectors.activeIndicator}`).isFocused();
                });

                browser.keys('ArrowRight');
                browser.keys('ArrowRight');
                browser.keys('ArrowRight');

                // should remain on third indicator & panel
                browser.waitUntil(() => {
                    return $(
                        `${selectors.activeIndicator}[id="indicator-id-03"]`
                    ).isFocused();
                });

                $(`#content-id-03`).waitForDisplayed();
            });
        });
    });
});

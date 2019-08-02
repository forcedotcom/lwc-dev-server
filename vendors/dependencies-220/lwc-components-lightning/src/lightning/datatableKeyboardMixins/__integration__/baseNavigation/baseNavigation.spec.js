function assertIsFocused(selector) {
    browser.waitUntil(() => browser.shadowElementHasFocus(selector));
}

describe('baseNavigation mixin from datatableKeyboardMixins', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    describe('when action ACTION mode', () => {
        describe('native inputable', () => {
            it('should focus the first focusable element in the DOM when invoke focus programmatically', () => {
                $('.native-inputables').click();
                $('native-inputables').click();
                assertIsFocused('native-inputables button');
            });
            it('should navigate in between focusable using tab', () => {
                $('.native-inputables').click();
                $('native-inputables').click();
                browser.keys('Tab');
                assertIsFocused('native-inputables input');
                browser.keys('Tab');
                assertIsFocused('native-inputables a');
                browser.keys('Tab');
                assertIsFocused('native-inputables textarea');
                browser.keys('Tab');
                assertIsFocused('native-inputables select');
            });
            it('should do nothing for keyboard arrows when the element implement native arrow navigation', () => {
                $('.native-inputables').click();
                $('native-inputables').click();
                browser.keys('ArrowRight');
                browser.pause(2000);
                assertIsFocused('native-inputables input');
                browser.keys('ArrowRight');
                browser.keys('ArrowLeft');
                assertIsFocused('native-inputables input');
            });
            it('should navigate in between focusable using arrow', () => {
                $('.native-inputables').click();
                $('native-inputables').click();
                browser.keys('ArrowRight');
                assertIsFocused('native-inputables input');
                browser.keys('Tab');
                assertIsFocused('native-inputables a');
                browser.keys('ArrowLeft');
                assertIsFocused('native-inputables input');
            });
            it('should skip inputables in disable state', () => {
                $('.native-inputables').click();
                $('.disable-input').click();
                $('native-inputables').click();
                browser.keys('ArrowRight');
                assertIsFocused('native-inputables a');
            });
            it('should skip anchor without href value', () => {
                $('.native-inputables').click();
                $('.remove-href').click();
                $('native-inputables').click();
                browser.keys('ArrowRight');
                browser.keys('Tab');
                assertIsFocused('native-inputables textarea');
            });
            it('should skip invisible element', () => {
                $('.native-inputables').click();
                $('.input-invisible').click();
                $('native-inputables').click();
                browser.keys('ArrowRight');
                assertIsFocused('native-inputables a');
            });
            it('should skip display:none elements', () => {
                $('.native-inputables').click();
                $('.input-display-none').click();
                $('native-inputables').click();
                browser.keys('ArrowRight');
                assertIsFocused('native-inputables a');
            });
            it('should not handle arrow when active handle arrow natively(input, select, ...)', () => {
                $('.native-inputables').click();
                $('native-inputables input').click();
                browser.keys('ArrowRight');
                assertIsFocused('native-inputables input');
            });
        });
    });
    describe('when NAVIGATION mode', () => {
        it('should not handle arrows', () => {
            $('.native-inputables-nav').click();
            $('native-inputables button').click();
            browser.keys('ArrowRight');
            assertIsFocused('native-inputables button');
        });
    });
});

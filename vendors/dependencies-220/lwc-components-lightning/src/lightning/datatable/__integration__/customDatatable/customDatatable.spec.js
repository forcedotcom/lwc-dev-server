const selectors = {
    ARROW_DOWN_BTN_FIRST_ROW:
        'datatable-customdatatable > x-extended-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > th > lightning-primitive-cell-factory > div > lightning-primitive-cell-types > x-datatable-row-ordering-buttons > div > div > button:nth-child(2)',
    ARROW_UP_BTN_SECOND_ROW:
        'datatable-customdatatable > x-extended-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > th > lightning-primitive-cell-factory > div > lightning-primitive-cell-types > x-datatable-row-ordering-buttons > div > div > button:nth-child(1)',
    ARROW_DOWN_BTN_SECOND_ROW:
        'datatable-customdatatable > x-extended-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > th > lightning-primitive-cell-factory > div > lightning-primitive-cell-types > x-datatable-row-ordering-buttons > div > div > button:nth-child(2)',
    ORDERING_FIRST_CELL:
        'datatable-customdatatable > x-extended-datatable > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > th',
    OUTSIDE_BTN:
        'body > datatable-customdatatable > div > lightning-button > button',
    TABLE: 'datatable-customdatatable > x-extended-datatable',
};

describe('customDatatable', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(selectors.TABLE).waitForExist();
        $('.focus-me-first').click();
    });

    describe('keyboard navigation in action in a custom type', () => {
        it('should focus the first focusable element when the table switch to ACTION mode', () => {
            browser.keys('Tab');
            browser.keys('Enter');
            browser.waitUntil(() => {
                return browser.shadowElementHasFocus(
                    selectors.ARROW_DOWN_BTN_FIRST_ROW
                );
            });
        });
        it.skip('should move in between focusable element using Tab when in ACTION mode', () => {
            browser.keys(['Tab', 'ArrowDown', 'Enter']);
            expect(
                browser.shadowElementHasFocus(selectors.ARROW_UP_BTN_SECOND_ROW)
            ).to.equal(true);
            browser.keys('Tab');
            expect(
                browser.shadowElementHasFocus(
                    selectors.ARROW_DOWN_BTN_SECOND_ROW
                )
            ).to.equal(true);
        });
        it('should switch from ACTION mode to NAV mode by pressing ESC', () => {
            browser.keys(['Tab', 'Enter', 'Escape']);
            expect(
                browser.shadowElementHasFocus(selectors.ORDERING_FIRST_CELL)
            ).to.equal(true);
        });
        it.skip('should step out of the table when NAV mode and press Tab', () => {
            browser.keys(['Tab', 'ArrowLeft', 'Tab']);
            expect(
                browser.shadowElementHasFocus(selectors.OUTSIDE_BTN)
            ).to.equal(true);
        });
    });
});

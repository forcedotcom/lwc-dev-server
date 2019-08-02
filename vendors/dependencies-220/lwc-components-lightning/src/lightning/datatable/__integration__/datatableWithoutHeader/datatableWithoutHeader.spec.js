function assertIsFocused(selector) {
    browser.waitUntil(() => browser.shadowElementHasFocus(selector));
}

describe('lightning-datatable without header', () => {
    const TABLE_HEAD = 'thead';
    const NAME_FIRST_CELL = 'tbody tr:nth-child(1) th:nth-of-type(1)';
    const NAME_LAST_CELL = 'tbody tr:nth-child(10) th';

    before(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should hide the table header when hide-table-header TRUE"', () => {
        expect($(TABLE_HEAD).isDisplayed()).to.equal(true);
    });
    it('should not move up when arrow up key was press and the active cell is in the first row', () => {
        $(NAME_FIRST_CELL).click();
        browser.keys('ArrowUp');
        assertIsFocused(NAME_FIRST_CELL);
    });
    it('should not move down when arrow down key was press and the active cell is in the last row', () => {
        $(NAME_LAST_CELL).click();
        browser.keys('ArrowDown');
        assertIsFocused(NAME_LAST_CELL);
    });
});

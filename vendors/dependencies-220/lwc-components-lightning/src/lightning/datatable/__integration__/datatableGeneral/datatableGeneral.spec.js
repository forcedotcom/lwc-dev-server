const TABLE = 'table';
const ROW_ONE_HEADER_CELL = '[data-row-key-value="1"] th';
const ROW_THREE_HEADER_CELL = '[data-row-key-value="3"] th';

const FOCUSED_CELL_CLASS = 'slds-cell-edit slds-has-focus';
const TABLE_FOCUS_ATTRIBUTE = 'tabindex';
const FOCUSED_TABLE_VALUE = 'false';
const NONFOCUSED_TABLE_VALUE = '0';

function assertIsCellFocused(cell) {
    const isFocused = $(cell).getAttribute('class');
    expect(isFocused).to.equal(FOCUSED_CELL_CLASS);
}
function assertIsTableNotFocused(table) {
    const isTableFocused = $(table).getAttribute(TABLE_FOCUS_ATTRIBUTE);
    expect(isTableFocused).to.equal(NONFOCUSED_TABLE_VALUE);
}
function assertIsTableFocused(table) {
    const isTableFocused = $(table).getAttribute(TABLE_FOCUS_ATTRIBUTE);
    expect(isTableFocused).to.equal(FOCUSED_TABLE_VALUE);
}
function setup() {
    const URL = browser.getStaticUrl(__filename);
    browser.url(URL);
}
describe('lightning-datatable, general accessibility tests', () => {
    beforeEach(setup);

    it('should select the component above the data table in the DOM tree when the shift+tab keys are pressed.', () => {
        $(ROW_THREE_HEADER_CELL).click();
        assertIsTableFocused(TABLE);

        browser.keys(['Shift', 'Tab', 'NULL']);
        assertIsTableNotFocused(TABLE);

        browser.keys('Tab');
        assertIsTableFocused(TABLE);
    });
});

describe('lightning-datatable, general accessibility tests When the focus is on the element before the data table', () => {
    beforeEach(() => {
        setup();
        $('.focus-me-first').click();
    });
    it('should select the first row if the table has not yet been selected  and the tab key is pressed.', () => {
        browser.keys('Tab');
        browser.keys('Tab');
        assertIsCellFocused(ROW_ONE_HEADER_CELL);
    });
    it('should select the last-selected row/column if the table is not selected and the tab key is pressed.', () => {
        $(ROW_THREE_HEADER_CELL).click();
        browser.keys('Tab');
        $('.focus-me-first').click();
        browser.keys('Tab');
        browser.keys('Tab');
        assertIsCellFocused(ROW_THREE_HEADER_CELL);
    });
});

const HEADER_CELL1 = 'thead th:nth-of-type(1)';
const HEADER_CELL1_CLICK = 'thead th:nth-of-type(1) span';

const ROW1_CELL1 = 'tbody td:nth-child(1)';
const ROW1_CELL5 = 'tbody td:nth-child(5),tbody th:nth-child(5)';
const ROW1_CELL2 = 'tbody td:nth-child(2)';

const ROW1_NAMECELL = '[data-row-key-value="1"] [data-label="Name"]';
const ROW2_NAMECELL = '[data-row-key-value="2"] [data-label="Name"]';
const ROW4_CELL1 = '[data-row-key-value="4"] td';

function assertIsFocused(cell) {
    const cellClass = $(cell).getAttribute('class');
    expect(cellClass).to.have.string('slds-has-focus');
}

describe('lightning-datatable, navigation mode', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should do nothing when the first cell in a row is selected and the left key is pressed.', () => {
        $(ROW1_CELL1).click();
        assertIsFocused(ROW1_CELL1);
        browser.keys('ArrowLeft');
        assertIsFocused(ROW1_CELL1);
    });
    it('should do nothing when the right key is pressed and the last cell of the row is selected.', () => {
        $(ROW1_CELL5).click();
        assertIsFocused(ROW1_CELL5);
        browser.keys('ArrowRight');
        assertIsFocused(ROW1_CELL5);
    });
    it('should select the previous cell in the row if the left key is pressed and the current cell is not first.', () => {
        $(ROW1_CELL2).click();
        assertIsFocused(ROW1_CELL2);
        browser.keys('ArrowLeft');
        assertIsFocused(ROW1_CELL1);
    });
    it('should select the next cell in the row if the right key is pressed and the current cell is not last.', () => {
        $(ROW1_CELL1).click();
        assertIsFocused(ROW1_CELL1);
        browser.keys('ArrowRight');
        assertIsFocused(ROW1_CELL2);
    });
    it('should select a cell from the previous row but same column when the up key is pressed and the current row is not first.', () => {
        $(ROW2_NAMECELL).click();
        assertIsFocused(ROW2_NAMECELL);
        browser.keys('ArrowUp');
        assertIsFocused(ROW1_NAMECELL);
    });
    it('should select a cell from the next row but same column when the down key is pressed and the current row is not last.', () => {
        $(ROW1_NAMECELL).click();
        assertIsFocused(ROW1_NAMECELL);
        browser.keys('ArrowDown');
        assertIsFocused(ROW2_NAMECELL);
    });
    it('should do nothing when the up key is pressed and the current row is first', () => {
        $(HEADER_CELL1_CLICK).click();
        assertIsFocused(HEADER_CELL1);
        browser.keys('ArrowUp');
        assertIsFocused(HEADER_CELL1);
    });
    it('should do nothing when the down key is pressed and the current row is last', () => {
        $(ROW4_CELL1).click();
        assertIsFocused(ROW4_CELL1);
        browser.keys('ArrowDown');
        assertIsFocused(ROW4_CELL1);
    });
});

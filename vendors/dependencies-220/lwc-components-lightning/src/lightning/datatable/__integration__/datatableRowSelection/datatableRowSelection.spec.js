const SELECTED_ROW_CLASS = 'slds-hint-parent slds-is-selected';
const DESELECTED_ROW_CLASS = 'slds-hint-parent';

const ROW_ONE = '[data-row-key-value="1"]';
const ROW_TWO = '[data-row-key-value="2"]';

const ROW_LIST = [
    '[data-row-key-value="1"]',
    '[data-row-key-value="2"]',
    '[data-row-key-value="3"]',
    '[data-row-key-value="4"]',
];

const HEADER_CHECKBOX = 'th [class="slds-checkbox_faux"]';
const FIRST_CHECKBOX = 'tr [class="slds-checkbox_faux"]';
const FIRST_SELECT_CELL = 'tr lightning-primitive-cell-checkbox';
const INPUT_SEARCH = 'input[name="search"]';
const FIRST_ROW_CHECKBOX =
    'tbody > tr:nth-child(1) > td:nth-child(2) > lightning-primitive-cell-checkbox > span > label > span.slds-checkbox_faux';

function assertRowSelected(row) {
    const isSelected = $(row).getAttribute('class');
    expect(isSelected).to.equal(SELECTED_ROW_CLASS);
}
function assertRowDeselected(row) {
    const isDeselected = $(row).getAttribute('class');
    expect(isDeselected).to.equal(DESELECTED_ROW_CLASS);
}

describe('lightning-datatable, row selection tests', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should select the current row when the row selection checkbox is not selected and clicked.', () => {
        $(FIRST_CHECKBOX).click();
        assertRowSelected(ROW_ONE);
    });
    it('should deselect the current row when the row selection checkbox is selected and clicked.', () => {
        $(FIRST_CHECKBOX).click();
        assertRowSelected(ROW_ONE);
        $(FIRST_CHECKBOX).click();
        assertRowDeselected(ROW_ONE);
    });
    it('should deselect all selected rows when selection header cell checkbox is selected and clicked.', () => {
        $(FIRST_CHECKBOX).click();
        assertRowSelected(ROW_ONE);
        $(HEADER_CHECKBOX).click();
        assertRowDeselected(ROW_ONE);
    });
    it('should select all rows when selection header cell checkbox is deselected and clicked.', () => {
        $(HEADER_CHECKBOX).click();
        ROW_LIST.forEach((row, index) => {
            assertRowSelected(row);
        });
    });

    it('should select the current row when the space key is pressed in a row selection cell that is not selected', () => {
        $(FIRST_SELECT_CELL).click();
        browser.keys('ArrowDown');
        browser.keys(' ');
        assertRowSelected('[data-row-key-value="2"]');
    });
    it('should deselect the current row when the space key is pressed in a row selection cell that is selected', () => {
        $(FIRST_SELECT_CELL).click();
        browser.keys('ArrowDown');
        browser.keys(' ');
        browser.keys(' ');
        assertRowDeselected('[data-row-key-value="2"]');
    });
    it('should deselect all selected rows when the space key is pressed on the selection header cell.', () => {
        $(FIRST_SELECT_CELL).click();
        assertRowSelected(ROW_ONE);
        browser.keys('ArrowUp');
        browser.keys(' ');
        browser.keys(' ');
        ROW_LIST.forEach((row, index) => {
            assertRowDeselected(row);
        });
    });
    it('should select all rows when the space key is pressed on the selection header cell and no rows are currently selected.', () => {
        $(FIRST_SELECT_CELL).click();
        browser.keys('ArrowUp');
        browser.keys(' ');
        browser.keys(' ');
        browser.keys(' ');
        ROW_LIST.forEach((row, index) => {
            assertRowSelected(row);
        });
    });
    it('should keep selection when filter', () => {
        $(FIRST_ROW_CHECKBOX).click();
        $(INPUT_SEARCH).setValue('A');
        const authors = $$('lightning-formatted-text');
        expect(authors.length).to.equal(2);
        expect(authors[0].getAttribute('innerText')).to.equal('John Snow');
        expect(authors[1].getAttribute('innerText')).to.equal('Arya Stark');
    });
});

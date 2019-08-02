const assert = require('assert');

const columnCell = 'tbody tr:nth-child({index}) *:nth-child({index2})';
const headerCell = 'thead tr:nth-child({index}) *:nth-child({index2})';
const actionCell = 'tbody tr:nth-child({index}) *:nth-child(4) button';
const menuItems =
    'tbody tr:nth-child({index}) *:nth-child(4) lightning-button-menu div[role="menu"]';
const menuItem =
    'tbody tr:nth-child({index}) *:nth-child(4) lightning-button-menu div[role="menu"] lightning-menu-item:nth-child({index2}) a';
const focusedClass = 'slds-has-focus';
const deleteButton = 'lightning-button:nth-of-type(1) button';
const changeButton = 'lightning-button:nth-of-type(2) button';

function clickCellAction(rowNumber, actionNumber) {
    $(actionCell.replace('{index}', rowNumber)).click();
    $(
        menuItem.replace('{index}', rowNumber).replace('{index2}', actionNumber)
    ).click();
}

function assertCellFocused(rowNumber, col, value) {
    const activeCell = $(
        columnCell.replace('{index}', rowNumber).replace('{index2}', col)
    );
    browser.waitUntil(() => {
        const active = browser.getShadowActiveElement();
        const text = browser.getElementAttribute(active.ELEMENT, 'innerText');
        return text.indexOf(value) >= 0;
    });
    browser.waitUntil(
        () => activeCell.getAttribute('class').indexOf(focusedClass) >= 0
    );
}

function assertHeaderCellFocused(rowNumber, col, value) {
    const activeCell = $(
        headerCell.replace('{index}', rowNumber).replace('{index2}', col)
    );
    browser.waitUntil(() => {
        const active = browser.getShadowActiveElement();
        const title = browser
            .getElementAttribute(active.ELEMENT, 'innerText')
            .toUpperCase();
        return title.indexOf(value) >= 0;
    });
    browser.waitUntil(
        () => activeCell.getAttribute('class').indexOf(focusedClass) >= 0
    );
}

describe('lightning-datatable maintains focus', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    describe('lightning-datatable should not lose focus when row is deleted', () => {
        it('should focus on next row cell when first row is deleted', () => {
            clickCellAction(1, 1);
            assertCellFocused(1, 1, 'syndicate');
        });
        it('should focus on next next row cell when first two rows are deleted', () => {
            clickCellAction(1, 3);
            assertCellFocused(1, 1, 'monetize');
        });
        it('should focus on next row cell when middle row is deleted', () => {
            clickCellAction(4, 1);
            assertCellFocused(4, 1, 'evolve');
        });
        it.skip('should focus on previous row last cell when last row is deleted', () => {
            clickCellAction(7, 1);
            assertCellFocused(6, 4, 'Show actions');
        });
        it.skip('should focus on previous previous row last cell when last two rows are deleted', () => {
            clickCellAction(7, 3);
            assertCellFocused(5, 4, 'Show actions');
        });
        it('should focus on last row cell when last row is deleted and one added ', () => {
            clickCellAction(7, 4);
            assertCellFocused(7, 4, 'Show actions');
        });

        it('should focus on next row first cell when there are only two rows', () => {
            $(changeButton).click();
            clickCellAction(1, 1);
            assertCellFocused(1, 1, 'syndicate');
        });
        it('should focus on header row cell when the only row is deleted ', () => {
            $(changeButton).click();
            clickCellAction(1, 1);
            clickCellAction(1, 1);
            assertHeaderCellFocused(1, 4, 'ACTION');
        });
    });
    describe('lightning-datatable should not lose focus when row and column is deleted', () => {
        it('should focus on next row cell when first row and first column is deleted', () => {
            clickCellAction(1, 5);
            assertCellFocused(1, 1, 'John Snow');
        });
        it('should focus on previous row cell when last row and last column is deleted', () => {
            clickCellAction(7, 6);
            assertCellFocused(6, 3, 'markus.wyman@example.com');
        });
    });
    describe('lightning-datatable should not lose focus when column is deleted', () => {
        it('should focus on first col cell when first column is deleted', () => {
            clickCellAction(1, 7);
            assertCellFocused(1, 1, 'Arya Stark');
        });
        it('should focus on previous row cell when last row and last column is deleted', () => {
            clickCellAction(1, 8);
            assertCellFocused(1, 1, 'matrix');
        });
    });
    describe('lightning-datatable should retain focus when row not in focus is deleted', () => {
        it('should not steal focus when row is deleted using action outside of dt', () => {
            $(deleteButton).click();

            const active = browser.getShadowActiveElement();
            const html = browser.getElementAttribute(
                active.ELEMENT,
                'outerHTML'
            );
            expect(html).to.equal($(deleteButton).getHTML());

            assert(
                $(columnCell.replace('{index}', 1).replace('{index2}', 1))
                    .getAttribute('class')
                    .indexOf(focusedClass) === -1
            );
        });
        it('should keep focus on the row when different row is deleted', () => {
            clickCellAction(1, 2);
            assertCellFocused(1, 4, 'Show actions');
        });
    });
});

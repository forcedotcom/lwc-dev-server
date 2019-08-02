const SECOND_COL =
    '/html/body/datatable-datatablesorting/lightning-datatable/div[2]/div/div/div/table/thead/tr/th[3]/lightning-primitive-header-factory/span/a';

function assertSecColIsSortedAsc() {
    const AGES = $$('lightning-formatted-number');
    const AGE_ROW_1 = +AGES[0].getText();
    const AGE_ROW_2 = +AGES[1].getText();
    const AGE_ROW_3 = +AGES[2].getText();
    const AGE_ROW_4 = +AGES[3].getText();
    const anchorClasses = $(SECOND_COL).getAttribute('class');

    expect(AGE_ROW_1).to.be.below(AGE_ROW_2);
    expect(AGE_ROW_2).to.be.below(AGE_ROW_3);
    expect(AGE_ROW_3).to.be.below(AGE_ROW_4);
    expect(anchorClasses).to.have.string('slds-is-sorted_asc');
}

function assertSecColIsSortedDesc() {
    const AGES = $$('lightning-formatted-number');
    const AGE_ROW_1 = +AGES[0].getText();
    const AGE_ROW_2 = +AGES[1].getText();
    const AGE_ROW_3 = +AGES[2].getText();
    const AGE_ROW_4 = +AGES[3].getText();
    const anchorClasses = $(SECOND_COL).getAttribute('class');

    expect(AGE_ROW_1).to.be.above(AGE_ROW_2);
    expect(AGE_ROW_2).to.be.above(AGE_ROW_3);
    expect(AGE_ROW_3).to.be.above(AGE_ROW_4);
    expect(anchorClasses).to.have.string('slds-is-sorted_desc');
}

describe('datatable sorting', () => {
    describe('The follow tests need to run en sequence', () => {
        it(
            'should sort the column to ascending order when the sorting header cell is clicked and the column is ' +
                'currently in descending order.',
            () => {
                const URL = browser.getStaticUrl(__filename);
                browser.url(URL);
                $(SECOND_COL).click();
                assertSecColIsSortedAsc();
            }
        );
        it(
            'should sort the column to descending order when the sorting header cell is clicked and the column is ' +
                'currently in ascending order.',
            () => {
                $(SECOND_COL).click();
                assertSecColIsSortedDesc();
            }
        );
        it(
            'should sort the column to ascending order when the enter key is pressed in a sorting header cell and ' +
                'the column is currently in descending order.',
            () => {
                browser.keys('Enter');
                assertSecColIsSortedAsc();
            }
        );
        it(
            'should sort the column to descending order when the enter key is pressed in a sorting header cell and ' +
                'the column is currently in ascending order.',
            () => {
                browser.keys('Enter');
                assertSecColIsSortedDesc();
            }
        );
    });
});

const NAME_HEADER = '[aria-label="Name"]';

describe('lightning-datatable resize a column', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should resize a column when the customer drag & drop on the column ', () => {
        const firstColumnHeader = 'th:nth-child(2) .slds-is-resizable';
        const firstColumnResizer = `${firstColumnHeader} span.slds-resizable__handle`;
        const { width: previousWidth } = $(NAME_HEADER).getSize();
        $(firstColumnResizer).moveTo();
        browser.buttonDown();
        $(firstColumnResizer).moveTo(50, 0);
        browser.buttonUp();
        const { width: currentWidth } = $(NAME_HEADER).getSize();
        expect(previousWidth).to.be.below(currentWidth);
    });
    it('should resize the column to be bigger when the column resizer is selected in action mode and the right key is pressed.', () => {
        $(
            'th:nth-child(1) lightning-primitive-header-factory div > span'
        ).click();
        browser.keys('ArrowRight');

        const previousWidth = $(NAME_HEADER).getSize('width');
        browser.keys('Enter');
        browser.keys('Tab');
        browser.keys('ArrowRight');
        const currentWidth = $(NAME_HEADER).getSize('width');
        expect(currentWidth).to.be.above(previousWidth);
    });
    it('should resize the column to be smaller when the column resizer is selected in action mode and the left key is pressed.', () => {
        $(
            'th:nth-child(1) lightning-primitive-header-factory div > span'
        ).click();
        browser.keys('ArrowRight');
        const previousWidth = $(NAME_HEADER).getSize('width');

        browser.keys('Enter');
        browser.keys('Tab');
        browser.keys('ArrowLeft');
        const currentWidth = $(NAME_HEADER).getSize('width');
        expect(currentWidth).to.be.below(previousWidth);
    });
});

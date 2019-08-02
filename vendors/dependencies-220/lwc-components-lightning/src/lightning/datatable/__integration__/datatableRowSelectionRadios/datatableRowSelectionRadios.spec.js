const assert = require('assert');
const SELECTORS = {
    firstRowRadioCell: 'tbody tr:nth-child(1) td:nth-child(2)',
    secondRowRadio: 'tbody tr:nth-child(2) td:nth-child(2) input[type="radio"]',
    thirdRowRadio: 'tbody tr:nth-child(3) td:nth-child(2) input[type="radio"]',
    secondRowRadioCell: 'tbody tr:nth-child(2) td:nth-child(2)',
};

describe('lightning-datatable, row selection tests', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should keep radio selected when right key is pressed', () => {
        // Enter action mode
        $(SELECTORS.secondRowRadioCell).click();
        browser.keys('Enter');

        browser.keys('Space');
        assert($(SELECTORS.secondRowRadio).isSelected());

        browser.keys('ArrowRight');
        assert($(SELECTORS.secondRowRadio).isSelected());
    });
    it('should keep radio selected when left key is pressed', () => {
        // Enter action mode
        $(SELECTORS.secondRowRadioCell).click();
        browser.keys('Enter');

        browser.keys('Space');
        assert($(SELECTORS.secondRowRadio).isSelected());

        browser.keys('ArrowLeft');
        assert($(SELECTORS.secondRowRadio).isSelected());
    });
    it('should not select the radio when entering ACTION mode with Enter', () => {
        //browser.leftClick(SELECTORS.secondRowRadioCell, 0, 0);
        $(SELECTORS.secondRowRadioCell).moveTo(0, 0);
        browser.buttonDown(0);
        browser.buttonUp(0);
        browser.keys('Enter');
        expect($(SELECTORS.secondRowRadio).isSelected()).to.equal(false);
    });
    it('should select the radio when entering ACTION mode with Space', () => {
        $(SELECTORS.secondRowRadioCell).moveTo(0, 0);
        browser.buttonDown(0);
        browser.buttonUp(0);
        browser.keys('Space');
        expect($(SELECTORS.secondRowRadio).isSelected()).to.equal(true);
    });
    it('should move the radio selection when using arrows and ACTION mode', () => {
        $(SELECTORS.secondRowRadioCell).moveTo(0, 0);
        browser.buttonDown(0);
        browser.buttonUp(0);
        browser.keys('Enter');
        browser.keys('Space');
        browser.keys('ArrowDown');
        expect($(SELECTORS.secondRowRadio).isSelected()).to.equal(false);
        expect($(SELECTORS.thirdRowRadio).isSelected()).to.equal(true);
    });
});

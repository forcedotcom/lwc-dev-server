const ACTIVE_ACCORDION_CLASS = 'slds-accordion__section slds-is-open';

const SECTION_TWO = '.section-2 > section';
const SECTION_THREE = '.section-3 > section';

const SECTION_TWO_BUTTON = '.section-2 > section button';
const SECTION_THREE_BUTTON = '.section-3 > section button';

describe('lightning-accordion integration, testing clicks', () => {
    it('should open Section B and close Section A when section A is opened & customer click in section B', () => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(SECTION_TWO_BUTTON).click();
        const sectionTwoClassBefore = $(SECTION_TWO).getAttribute('class');
        expect(sectionTwoClassBefore).to.equal(ACTIVE_ACCORDION_CLASS);

        $(SECTION_THREE_BUTTON).click();
        const sectionThreeClass = $(SECTION_THREE).getAttribute('class');
        expect(sectionThreeClass).to.equal(ACTIVE_ACCORDION_CLASS);

        const sectionTwoClass = $(SECTION_TWO).getAttribute('class');
        expect(sectionTwoClass).not.to.equal(ACTIVE_ACCORDION_CLASS);
    });
});

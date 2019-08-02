const ACTIVE_ACCORDION_CLASS = 'slds-accordion__section slds-is-open';

const SECTION_ONE = '.section-1 > section';
const SECTION_TWO = '.section-2 > section';
const SECTION_HIDDEN = '.section-hidden > section';

const SECTION_HIDDEN_BUTTON = '.section-hidden > section button';
const SECTION_THREE_TEXT = '.section-3 > section .slds-accordion__content p';

const HIDE_BUTTON_ID = '.hide-button';
const CHANGE_BUTTON_ID = '.change-button';
const ACTIVE_BUTTON_ID = '.active-button';

describe('lightning-accordion integration, conditional sections', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should be able to hide/show accordion sections using if condition', () => {
        $(HIDE_BUTTON_ID).click();
        $(SECTION_HIDDEN_BUTTON).click();
        const hiddenAccordionObject = $(SECTION_HIDDEN).getAttribute('class');
        expect(hiddenAccordionObject).to.equal(ACTIVE_ACCORDION_CLASS);
    });
    it('should be able to change the content of one accordion section dynamically', () => {
        const valueOfSectionBefore = $(SECTION_THREE_TEXT).getHTML(false);
        expect(valueOfSectionBefore).to.equal(
            'Nulla ornare ipsum felis, vel aliquet dui blandit vel. Integer accumsan velit quis mauris pharetra, nec sollicitudin dui eleifend. Cras condimentum odio mi, nec ullamcorper arcu ullamcorper sed. Proin massa arcu, rutrum a ullamcorper nec, hendrerit in sem. Etiam tempus eros ut lorem tincidunt, id condimentum nulla molestie. Morbi hendrerit elit pretium, ultrices neque non, ullamcorper justo. Quisque vel nisi eget eros efficitur semper. Nulla pulvinar venenatis quam vitae efficitur. Nam facilisis sollicitudin quam ac imperdiet.'
        );

        $(CHANGE_BUTTON_ID).click();
        const valueOfAccordianSection = $(SECTION_THREE_TEXT).getHTML(false);
        expect(valueOfAccordianSection).to.equal(
            'According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground.'
        );
    });
    it('should be able to change active sections programmatically ', () => {
        const firstAccordionObject = $(SECTION_ONE).getAttribute('class');
        expect(firstAccordionObject).to.equal(ACTIVE_ACCORDION_CLASS);

        $(ACTIVE_BUTTON_ID).click();
        const activeAccordionObject = $(SECTION_TWO).getAttribute('class');
        expect(activeAccordionObject).to.equal(ACTIVE_ACCORDION_CLASS);
    });
});

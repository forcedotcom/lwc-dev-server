const PILL = 'lightning-pill';

describe('pill without media', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
        $(PILL).waitForExist();
    });

    it('it should not render the "slot" element when pill has no media', () => {
        const slotElement = $(PILL).shadow$('slot');
        expect(slotElement.isExisting()).to.equal(false);
    });
});

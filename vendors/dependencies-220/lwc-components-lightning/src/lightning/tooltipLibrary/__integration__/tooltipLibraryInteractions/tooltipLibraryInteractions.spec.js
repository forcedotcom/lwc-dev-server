const selectors = {
    elementWithStaticTooltip: '.tooltip-static',
    elementWithoutTooltip: '.tooltip-none',
    tooltip: 'lightning-primitive-bubble',
};

const tooltips = {
    static: 'Static',
};

function setup() {
    const URL = browser.getStaticUrl(__filename);
    browser.url(URL);
    $(selectors.tooltip).waitForExist();
    $('.focus-me-first').click();
}

function verifyTooltipVisibility(visible, message) {
    const tooltip = $(selectors.tooltip);
    browser.waitUntil(
        () => {
            const visibility = tooltip.getCSSProperty('visibility').value;
            return visible ? visibility === 'visible' : visibility === 'hidden';
        },
        undefined,
        message
    );
}

function verifyTooltipAlignment(vAlign) {
    verifyTooltipVisibility(true, 'expected tooltip to be visible');

    // The nubbin is at the top when the tooltip is below the target.
    const tooltip = $(selectors.tooltip);
    const expected =
        vAlign === 'bottom' ? 'slds-nubbin_top' : 'slds-nubbin_bottom';
    expect(tooltip.getAttribute('class')).to.contain(expected);
}

describe('Tooltip interactions', () => {
    beforeEach(setup);

    it('should show/hide a tooltip when the mouse enters/leaves a target with a tooltip', () => {
        // Move the mouse into the target.
        $(selectors.elementWithStaticTooltip).moveTo();
        verifyTooltipVisibility(
            true,
            'expected tooltip to be visible when mouse enters the target'
        );
        expect($(selectors.tooltip).getAttribute('innerText')).to.equal(
            tooltips.static
        );

        // Move the mouse out of the target.
        $(selectors.elementWithoutTooltip).moveTo();
        verifyTooltipVisibility(
            false,
            'expected tooltip to be hidden when mouse leaves the target'
        );
    });

    it('should show/hide a tooltip when focus is given/taken from a target with a tooltip', () => {
        // Give focus to the target.
        browser.keys('Tab');
        verifyTooltipVisibility(
            true,
            'expected tooltip to be visible when target gets focus'
        );
        expect($(selectors.tooltip).getAttribute('innerText')).to.equal(
            tooltips.static
        );

        // Give focus to a different element.
        browser.keys('Tab');
        verifyTooltipVisibility(
            false,
            'expected tooltip to be hidden when target loses focus'
        );
    });

    it('should not show a tooltip when a target has an empty tooltip value', () => {
        // Move the mouse to a target that has no tooltip value set.
        $(selectors.elementWithoutTooltip).moveTo();
        browser.pause(1000);
        expect(
            $(selectors.tooltip).getCSSProperty('visibility').value
        ).to.equal('hidden');
    });

    it('should hide a tooltip when a target showing a tooltip is clicked', () => {
        // Move the mouse into the target.
        $(selectors.elementWithStaticTooltip).moveTo();
        verifyTooltipVisibility(true, 'expected tooltip to be visible');

        // Click the target.
        $(selectors.elementWithStaticTooltip).click();
        verifyTooltipVisibility(
            false,
            'expected tooltip to be hidden when target is clicked'
        );
    });

    it('should hide a tooltip when keys are pressed on a focused target', () => {
        // Give focus to the target.
        browser.keys('Tab');
        verifyTooltipVisibility(
            true,
            'expected tooltip to be visible when target gets focus'
        );

        // Press a key.
        browser.keys('Space');
        verifyTooltipVisibility(
            false,
            'expected tooltip to be hidden when keys are pressed on a focused target'
        );
    });

    it('confirms that the tooltip displays below the button due to limited space above the target', () => {
        // Give focus to the target.
        browser.keys('Tab');
        verifyTooltipAlignment('bottom');
    });

    it('confirms that the tooltip displays above the button', () => {
        // Give focus to the target.
        browser.keys(['Tab', 'Tab', 'Tab']);
        verifyTooltipAlignment('top');
    });
});

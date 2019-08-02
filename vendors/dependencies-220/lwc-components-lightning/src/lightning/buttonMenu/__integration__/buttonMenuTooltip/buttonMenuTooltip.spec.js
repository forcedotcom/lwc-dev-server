const selectors = {
    elementWithStaticTooltip: '.tooltip-static',
    elementWithDynamicTooltip: '.tooltip-dynamic',
    tooltip: 'lightning-primitive-bubble',
};

const tooltips = {
    static: 'Static',
    dynamic: 'Dynamic',
};

function setup() {
    const URL = browser.getStaticUrl(__filename);
    browser.url(URL);
    $(selectors.tooltip).waitForExist();
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

describe('Tooltip interactions with buttonMenu', () => {
    beforeEach(setup);

    it('should show a tooltip when a target has a static tooltip value', () => {
        // Move the mouse into the target.
        $(selectors.elementWithStaticTooltip).moveTo();
        verifyTooltipVisibility(
            true,
            'expected tooltip to be visible when mouse enters the target'
        );
        const text = $(selectors.tooltip).getAttribute('innerText');
        expect(text).to.equal(tooltips.static);
    });

    it('should show a tooltip when a target has a dynamically set tooltip value', () => {
        // Dynamically set a tooltip value on the target.
        browser.execute(
            function(selector, tooltip) {
                document.querySelector(selector).tooltip = tooltip;
            },
            selectors.elementWithDynamicTooltip,
            tooltips.dynamic
        );

        // Move the mouse into the target.
        $(selectors.elementWithDynamicTooltip).moveTo();
        verifyTooltipVisibility(
            true,
            'expected tooltip to be visible when mouse enters the target'
        );
        expect($(selectors.tooltip).getAttribute('innerText')).to.equal(
            tooltips.dynamic
        );
    });

    it('should not show a tooltip when a target dynamically has its tooltip set to an empty value', () => {
        // Dynamically clear a tooltip value on the target.
        browser.execute(function(selector) {
            document.querySelector(selector).tooltip = '';
        }, selectors.elementWithStaticTooltip);

        // Move the mouse to a target that has no tooltip value set.
        $(selectors.elementWithStaticTooltip).moveTo();
        browser.pause(1000);
        expect(
            $(selectors.tooltip).getCSSProperty('visibility').value
        ).to.equal('hidden');
    });
});

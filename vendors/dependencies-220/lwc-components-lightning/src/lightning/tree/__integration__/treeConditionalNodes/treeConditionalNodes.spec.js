const ARIA_EXPANDED = 'aria-expanded';

const COLLAPSE_BUTTON_ID = '.collapse-button';
const EXPAND_BUTTON_ID = '.expand-button';

const NODE_1 = '[data-key = "1"]';
const NODE_3 = '[data-key = "3"]';

function assertIsExpanded(node) {
    const ariaExpanded = $(node).getAttribute(ARIA_EXPANDED);
    expect(ariaExpanded).to.equal('true');
}
function assertIsCollapsed(node) {
    const ariaExpanded = $(node).getAttribute(ARIA_EXPANDED);
    expect(ariaExpanded).to.equal('false');
}

describe('lightning-tree integration, testing conditional nodes', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should be able to expand nodes programmatically.', () => {
        $(COLLAPSE_BUTTON_ID).click();
        assertIsCollapsed(NODE_1);
    });
    it('should be able to collapse nodes programmatically', () => {
        $(EXPAND_BUTTON_ID).click();
        assertIsExpanded(NODE_3);
    });
});

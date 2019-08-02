const ARIA_SELECTED = 'aria-selected';
const ARIA_EXPANDED = 'aria-expanded';

const NODE_1 = '[data-key="1"]';
const NODE_2 = '[data-key="2"]';
const NODE_3 = '[data-key="3"]';
const NODE_11 = '[data-key="1.1"]';
const NODE_12 = '[data-key="1.2"]';
const NODE_121 = '[data-key="1.2.1"]';
const NODE_1211 = '[data-key="1.2.1.1"]';

const NODE_1_ICON = '[data-key="1"] button';
const NODE_3_ICON = '[data-key="3"] button';
const NODE_1211_ICON = '[data-key="1.2.1.1"] button';

const NODE_1_CLICK = '[data-key="1"] a';

function assertIsSelected(node) {
    const ariaSelected = $(node).getAttribute(ARIA_SELECTED);
    expect(ariaSelected).to.equal('true');
}
function assertIsExpanded(node) {
    const ariaExpanded = $(node).getAttribute(ARIA_EXPANDED);
    expect(ariaExpanded).to.equal('true');
}
function assertIsCollapsed(node) {
    const ariaExpanded = $(node).getAttribute(ARIA_EXPANDED);
    expect(ariaExpanded).to.equal('false');
}

describe('lightning-tree integration', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should select the current node if the mouse clicks on the current node', () => {
        $(NODE_1_CLICK).click();
        assertIsSelected(NODE_1);
    });
    it('should collapse the current node if the the current node is open and the arrow icon for the current node is clicked.', () => {
        $(NODE_1_ICON).click();
        assertIsCollapsed(NODE_1);
    });
    it('should expand the current node if the the current node is closed and the arrow icon for the current node is clicked.', () => {
        $(NODE_3_ICON).click();
        assertIsExpanded(NODE_3);
    });

    it('should stay in the same state as before when the current, expanded node is collapsed and then expanded again.', () => {
        $(NODE_1211_ICON).click();
        assertIsExpanded(NODE_12);
        assertIsExpanded(NODE_121);
        assertIsCollapsed(NODE_1211);

        $(NODE_1_ICON).click();
        $(NODE_1_ICON).click();
        assertIsExpanded(NODE_12);
        assertIsExpanded(NODE_121);
        assertIsCollapsed(NODE_1211);
    });
});

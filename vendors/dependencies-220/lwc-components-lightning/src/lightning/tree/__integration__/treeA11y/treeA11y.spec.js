const ARIA_SELECTED = 'aria-selected';
const ARIA_EXPANDED = 'aria-expanded';

const NODE_1 = '[data-key="1"]';
const NODE_2 = '[data-key="2"]';
const NODE_3 = '[data-key="3"]';
const NODE_11 = '[data-key="1.1"]';
const NODE_12 = '[data-key="1.2"]';
const NODE_121 = '[data-key="1.2.1"]';
const NODE_1211 = '[data-key="1.2.1.1"]';
const NODE_121121 = '[data-key="1.2.1.1.2.1"]';
const NODE_21 = '[data-key="2.1"]';

const NODE_1_ICON = '[data-key="1"] button';
const NODE_3_ICON = '[data-key="3"] button';
const NODE_1211_ICON = '[data-key="1.2.1.1"] button';

const NODE_1_CLICK = '[data-key="1"] a';
const NODE_2_CLICK = '[data-key="2"] a';
const NODE_3_CLICK = '[data-key="3"] a';
const NODE_1211_CLICK = '[data-key="1.2.1.1"] a';
const NODE_12111_CLICK = '[data-key="1.2.1.1.1"] a';

function assertIsSelected(node) {
    const ariaSelected = $(node).getAttribute(ARIA_SELECTED);
    expect(ariaSelected).to.equal('true');
}
function assertNotSelected(node) {
    const ariaSelected = $(node).getAttribute(ARIA_SELECTED);
    expect(ariaSelected).to.equal('false');
}
function assertIsExpanded(node) {
    const ariaExpanded = $(node).getAttribute(ARIA_EXPANDED);
    expect(ariaExpanded).to.equal('true');
}
function assertIsCollapsed(node) {
    const ariaExpanded = $(node).getAttribute(ARIA_EXPANDED);
    expect(ariaExpanded).to.equal('false');
}

describe('lightning-tree integration, testing keystrokes', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should not do anything when the up key is pressed on the first component.', () => {
        $(NODE_1_CLICK).click();
        browser.keys('Arrow Up');
        assertIsSelected(NODE_1);
    });
    it('should not do anything when the down key is pressed on the last component.', () => {
        $(NODE_3_CLICK).click();
        browser.keys('Arrow Down');
        assertIsSelected(NODE_3);
    });
    it('should select the next open node when the down key is pressed and the current node is not last', () => {
        $(NODE_1_CLICK).click();
        browser.keys('ArrowDown');
        assertIsSelected(NODE_11);
    });
    it('should select the previous open node when the up key is pressed and the current node is not first', () => {
        $(NODE_2_CLICK).click();
        browser.keys('ArrowUp');
        assertIsSelected(NODE_121121);
    });
    it('should collapse the parent node when the left key is pressed on a leaf node.', () => {
        $(NODE_12111_CLICK).click();
        browser.keys('ArrowLeft');
        assertIsCollapsed(NODE_1211);
    });
    it('should collapse the current node when the left key is pressed on an open node (that is not a leaf)', () => {
        $(NODE_1211_CLICK).click();
        browser.keys('ArrowLeft');
        assertIsCollapsed(NODE_1211);
    });
    it('should expand the current node node when the right key is pressed on a closed node', () => {
        $(NODE_3_CLICK).click();
        browser.keys('ArrowRight');
        assertIsExpanded(NODE_3);
    });
    it('should not expand the child node when the right key is pressed on an open node ', () => {
        $(NODE_2_CLICK).click();
        browser.keys('ArrowRight');
        assertIsCollapsed(NODE_21);
    });
    it('should select the current node if the space key is pressed on the current node', () => {
        $(NODE_3_ICON).click();
        assertNotSelected(NODE_3);

        browser.keys(' ');
        assertIsSelected(NODE_3);
    });
    it('should select the current node if the enter key is pressed on the current node', () => {
        $(NODE_3_ICON).click();
        assertNotSelected(NODE_3);

        browser.keys('Enter');
        assertIsSelected(NODE_3);
    });
    it('should close the parent node when the left key is pressed on a closed node (when it is not a root node)', () => {
        $(NODE_21).click();
        browser.keys('ArrowLeft');
        assertIsCollapsed(NODE_2);
    });
});

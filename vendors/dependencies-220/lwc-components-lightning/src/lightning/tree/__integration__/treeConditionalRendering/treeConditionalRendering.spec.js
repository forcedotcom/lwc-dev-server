const CHANGE_BUTTON_ID = '.change-button';
const before = [
    '1',
    '1.1',
    '1.2',
    '1.2.1',
    '1.2.1.1',
    '1.2.1.1.1',
    '1.2.1.1.2',
    '1.2.1.1.2.1',
    '2',
    '2.1',
    '2.1.1',
    '3',
    '3.1',
];
const after = [
    '1',
    '1.1',
    '1.2',
    '1.2.1',
    '2',
    '2.1',
    '2.1.1',
    '2.2',
    '3',
    '3.1',
];

describe('lightning-tree integration, testing conditional rendering', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should be able to replace the tree content dynamically', () => {
        before.forEach(expectedDataKey => {
            const currentNode = $(`[data-key="${expectedDataKey}"]`);
            expect(currentNode.value).to.not.equal(null);
        });

        $(CHANGE_BUTTON_ID).click();
        after.forEach(expectedDataKey => {
            const currentNode = $(`[data-key="${expectedDataKey}"]`);
            expect(currentNode.value).to.not.equal(null);
        });
    });
});

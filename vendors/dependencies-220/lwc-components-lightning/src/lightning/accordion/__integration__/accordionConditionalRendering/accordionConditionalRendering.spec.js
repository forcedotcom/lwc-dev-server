const CHANGE_BUTTON_ID = '.change-button';

const before = [
    'The Outsiders',
    'Le Petit Prince',
    'The Dog of Flanders',
    'Catcher in the Rye',
];
const after = [
    'Parent Trap',
    'Black Panther',
    'Avengers',
    'Deadpool',
    'Toy Story',
];

describe('lightning-accordion integration, conditional rendering', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should be able to replace the accordion content dynamically using iteration ', () => {
        before.forEach((expectedLabel, index) => {
            const currentLabel = $(`#section-${index + 1}-1`).getAttribute(
                'label'
            );
            expect(expectedLabel).to.equal(currentLabel);
        });

        $(CHANGE_BUTTON_ID).click();

        after.forEach((expectedLabel, index) => {
            const currentLabel = $(`#section-${index + 1}-1`).getAttribute(
                'label'
            );
            expect(expectedLabel).to.equal(currentLabel);
        });
    });
});

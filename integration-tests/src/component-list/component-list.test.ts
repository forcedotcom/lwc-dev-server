import HomePage from '../pageObjects/HomePage';

describe('Component Listing on the Home Page', () => {
    it('When viewing the home page you see a component list', async () => {
        await HomePage.open();

        const list = await HomePage.componentList;
        const text = await list.getText();
        expect(text).toBe(
            'c-component1\nc-component-one\nc-component-two\nc-hello\nc-the-life'
        );
    });

    it('opens the home page, checks all list', async () => {
        await HomePage.open();
        await HomePage.filter('hel');
        const text = await (await HomePage.componentList).getText();

        expect(text).toBe('c-hello\nc-the-life');
    });
});

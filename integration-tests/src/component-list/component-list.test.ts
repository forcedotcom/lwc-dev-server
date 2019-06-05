import HomePage from '../pageObjects/HomePage';

describe('Component Listing on the Home Page', () => {
    it('When viewing the home page you see a component list', async () => {
        await HomePage.open();

        const list: WebdriverIO.Element = await HomePage.containerList;
        const text = await list.getText();

        expect(text).toBe(
            'test-component1\ntest-componentOne\ntest-componentTwo\ntest-hello\ntest-theLife'
        );
    });

    it('opens the home page, checks all list', async () => {
        await HomePage.open();
        await HomePage.filter('hel');
        const text = await (await HomePage.containerList).getText();

        expect(text).toBe('test-hello\ntest-theLife');
    });
});

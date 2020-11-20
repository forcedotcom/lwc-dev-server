import HomePage from '../pageObjects/HomePage';

describe('Component Listing on the Home Page', () => {
    it('When viewing the home page you see a component list', async () => {
        await HomePage.open();

        const list = await HomePage.componentList;
        const text = await list.getText();
        expect(text).toBe('c-component-one\nc-component-two');
    });
});

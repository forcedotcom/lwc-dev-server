import HomePage from '../pageObjects/HomePage';

describe('Basic Example', () => {
    it('opens the home page', async () => {
        await HomePage.open();
        const list = await HomePage.componentList;
        const text = await list.getText();
        expect(text).toBe('test-hello');
    });
});

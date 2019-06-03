import HomePageObject from '../pageobjects/homePageObject';

describe('Home Page Component List', () => {
    const homePO = new HomePageObject();

    it('opens the home page, checks all list', async () => {
        await homePO.load();
        const text = await homePO.componentList();

        expect(text).toBe('test-componentOne\ntest-componentTwo\ntest-hello');
    });

    it('opens the home page, checks all list', async () => {
        await homePO.load();
        await homePO.filter('hell');
        const text = await homePO.componentList();

        expect(text).toBe('test-hello');
    });
});

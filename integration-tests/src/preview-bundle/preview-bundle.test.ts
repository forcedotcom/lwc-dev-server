import PreviewPage from '../pageObjects/PreviewPage';

describe('previewing an LWC bundle', () => {
    it('renders expected content', async () => {
        const page = new PreviewPage('test', 'testComponent');
        await page.open();

        const testComponent = await page.testComponent;
        const content = await testComponent.shadow$('.content');
        const text = await content.getText();

        expect(text).toBe('Hello, World!');
    });

    it('renders expected component style', async () => {
        const page = new PreviewPage('test', 'testComponent');
        await page.open();

        const testComponent = await page.testComponent;
        const content = await testComponent.shadow$('.content');

        const fontSize = await browser.execute(el => {
            return (window.getComputedStyle(el) || el.style).getPropertyValue(
                'font-size'
            );
        }, content);

        expect(fontSize).toBe('80px');
    });
});

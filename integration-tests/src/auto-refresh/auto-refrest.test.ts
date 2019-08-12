import fs from 'fs-extra';
import path from 'path';
import PreviewPage from '../pageObjects/PreviewPage';

describe('Auto Reload', () => {
    const lwcFolder = path.join(
        __dirname,
        'project/force-app/main/default/lwc'
    );

    it('Test that updating a file will auto reload the page', async () => {
        // copy autoreload to autoreloadtesting
        const testingTargetDir = path.join(lwcFolder, 'autoreloadtestingcopy');
        const testingTargetHtml = path.join(
            testingTargetDir,
            'autoreloadtestingcopy.html'
        );
        if (fs.existsSync(testingTargetDir)) {
            fs.removeSync(testingTargetDir);
        } else if (!fs.existsSync(testingTargetDir)) {
            fs.mkdirSync(testingTargetDir);
        }

        fs.copyFileSync(
            path.join(lwcFolder, 'autoreload', 'autoreload.html'),
            path.join(testingTargetDir, 'autoreloadtestingcopy.html')
        );
        fs.copyFileSync(
            path.join(lwcFolder, 'autoreload', 'autoreload.js'),
            path.join(testingTargetDir, 'autoreloadtestingcopy.js')
        );
        // load autoreloadtesting testing page
        const previewPage: PreviewPage = new PreviewPage(
            'c',
            'autoreloadtestingcopy'
        );
        await previewPage.open();
        let pageContainer = await previewPage.testComponent;
        const originalText = await (await pageContainer.shadow$(
            '.content'
        )).getText();

        expect(originalText).toBe('Initial Content');

        // edit autoreloadtesting
        await fs.copyFile(
            path.join(lwcFolder, 'autoreload', 'autoreload2.html'),
            testingTargetHtml
        );

        // verify new content appears
        let newText = '';
        await browser.waitUntil(
            async () => {
                newText = await (await pageContainer.shadow$(
                    '.content'
                )).getText();
                return originalText !== newText;
            },
            20000,
            'Timeout waiting for page to autoreload',
            100
        );

        expect(newText).toBe('New Content');
    });
});

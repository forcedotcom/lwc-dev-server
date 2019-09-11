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
        await fs.remove(testingTargetDir);
        await fs.ensureDir(testingTargetDir);
        await fs.copy(
            path.join(lwcFolder, 'autoreload', 'autoreload.html'),
            path.join(testingTargetDir, 'autoreloadtestingcopy.html')
        );
        await fs.copy(
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
        const newFile = path.join(lwcFolder, 'autoreload', 'autoreload2.html');
        await fs.copy(newFile, testingTargetHtml);

        // 'touch' the file to make sure it picks up the update
        const time = new Date();
        await fs.utimes(newFile, time, time);

        // verify new content appears
        let newText = '';
        await browser.waitUntil(async () => {
            return Promise.resolve(pageContainer.getText()).then(text => {
                newText = text;
                return originalText !== text;
            });
        }, 10000);

        expect(newText).toBe('New Content');
    });
});

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
        if (fs.existsSync(testingTargetHtml)) {
            fs.removeSync(testingTargetHtml);
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
        console.error('copying autoreload2.html to autoreloadtestingcopy.html');
        // edit autoreloadtesting
        await fs.copyFile(
            path.join(lwcFolder, 'autoreload', 'autoreload2.html'),
            testingTargetHtml
        );
        // verify new content appears
        let newText = '';
        const start = Date.now();
        console.error('Starting at', start);

        setTimeout(function() {
            browser.refresh();
        }, 10000);
        await browser.waitUntil(
            async () => {
                newText = await pageContainer.getText();
                console.error(
                    'Trace',
                    newText,
                    originalText,
                    Date.now() - start
                );
                return originalText !== newText;
                // return Promise.resolve(pageContainer.getText()).then(text => {

                //     newText = text;
                //     return originalText !== text;
                // });
            },
            50000,
            'Timeout waiting for page to autoreload',
            100
        );

        console.error('Duration', Date.now() - start);

        expect(newText).toBe('New Content');
    });
});

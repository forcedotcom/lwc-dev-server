import fs from 'fs-extra';
import path from 'path';
import PreviewPage from '../pageObjects/PreviewPage';

describe('Auto Reload', () => {
    const lwcFolder = path.join(
        __dirname,
        'project/force-app/main/default/lwc'
    );

    it('should reload the page when a component is updated', async () => {
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
        const pageContainer = await previewPage.testComponent;
        const originalText = await (
            await pageContainer.shadow$('.content')
        ).getText();
        const originalTime = await (
            await pageContainer.shadow$('.time')
        ).getText();

        expect(originalText).toBe('Initial Content');

        // edit autoreloadtesting
        const newFile = path.join(lwcFolder, 'autoreload', 'autoreload2.html');
        await fs.copy(newFile, testingTargetHtml);

        // verify new content appears
        await browser.waitUntil(async () => {
            const newText = await (
                await pageContainer.shadow$('.content')
            ).getText();
            const newTime = await (
                await pageContainer.shadow$('.time')
            ).getText();

            return originalText !== newText && originalTime !== newTime;
        }, 10000);
    });

    it('should not reload the page when an ignored file is updated', async () => {
        const testingTargetFile = path.join(lwcFolder, 'jsconfig.json');

        // TODO: copy project to tmp directory for safe file modification.
        await fs.remove(testingTargetFile);
        await fs.createFile(testingTargetFile);
        await fs.writeFile(
            testingTargetFile,
            JSON.stringify({
                compilerOptions: {
                    experimentalDecorators: false
                },
                typeAcquisition: {
                    include: ['jest']
                }
            })
        );

        const previewPage: PreviewPage = new PreviewPage('c', 'autoreload');
        await previewPage.open();
        const pageContainer = await previewPage.testComponent;
        const originalTime = await (
            await pageContainer.shadow$('.time')
        ).getText();

        // update the target file
        // the content of the update does not matter
        await fs.writeFile(
            testingTargetFile,
            JSON.stringify(
                {
                    compilerOptions: {
                        experimentalDecorators: true
                    },
                    typeAcquisition: {
                        include: ['jest']
                    }
                },
                null,
                4
            )
        );

        // verify the page did not reload
        // the time element should not change since the page is not reloaded.
        await new Promise(resolve => setTimeout(resolve, 5000));
        const newTime = await (await pageContainer.shadow$('.time')).getText();
        expect(newTime).toBe(originalTime);
    });
});

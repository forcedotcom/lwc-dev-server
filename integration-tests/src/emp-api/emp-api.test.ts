import fs from 'fs-extra';
import path from 'path';
import PreviewPage from '../pageObjects/PreviewPage';

describe('lightning:empApi Component', () => {
    const lwcFolder = path.join(
        __dirname,
        'project/force-app/main/default/lwc'
    );

    it('loads', async () => {
        let page = new PreviewPage('c', 'empApiLWC');
        await page.open();

        const gothere = '';
    });
});

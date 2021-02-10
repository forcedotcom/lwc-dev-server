import PreviewPage from '../pageObjects/PreviewPage';

describe('compile-error', () => {
    it('loads', async () => {
        const errorTxt =
            'Invalid HTML syntax: invalid-first-character-of-tag-name. For more information, please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-invalid-first-character-of-tag-name';
        let page = new PreviewPage('c', 'compileError');

        await page.open();

        const error = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/localdevserver-error/section/div/div/h1'
            )
        );
        const vscodeLink = await page.container.then(el =>
            el.$(
                '/html/body/localdevserver-app/localdevserver-layout/slot[2]/main/localdevserver-view/localdevserver-dynamic/localdevserver-layout-section/slot/article/div[2]/localdevserver-error/section/div/div/h3/a'
            )
        );

        expect(await error.getText()).toBe(errorTxt);
        expect(await vscodeLink.getText()).toBe('Go to source (vscode)');
        expect(await vscodeLink.getAttribute('href')).toMatch(
            new RegExp(
                '^vscode://file.*/lwc-dev-server/integration-tests/src/compile-error/project/force-app/main/default/lwc/compileError/compileError.html:4:9'
            )
        );
    });
});

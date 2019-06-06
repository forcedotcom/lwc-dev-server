class PreviewPage {
    private _container: WebdriverIO.Element | undefined;

    /**
     * Opens the preview page for a component.
     *
     * @param namespace The component namespace.
     * @param name The component name in **camelCase**.
     */
    public async open(namespace: string, name: string) {
        await browser.url(
            `http://localhost:${
                global.serverPort
            }/lwc/preview/${namespace}/${name}`
        );
        return browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-preview'))
            .then(el => (this._container = el));
    }

    public get container() {
        if (this._container) {
            return Promise.resolve(this._container);
        }
        throw new Error('container not initialized first, call open() first');
    }
}

export default new PreviewPage();

export default class HomePageObject {
    private container: WebdriverIO.Element | undefined;

    public async load(): Promise<HomePageObject> {
        await browser.url(`http://localhost:${global.serverPort}`);
        this.container = await browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-home'));
        return this;
    }

    public async componentList(): Promise<String> {
        if (this.container) {
            return await (await this.container.shadow$(
                '.component-list'
            )).getText();
        }
        return Promise.reject(
            'container not initialized first, call load() first'
        );
    }

    protected get filterInput(): Promise<WebdriverIO.Element> {
        if (this.container) {
            return Promise.resolve(
                this.container.shadow$('input[name="component-filter"]')
            );
        }
        throw new Error('container not initialized first, call load() first');
    }

    public async filter(filter: string) {
        return this.filterInput.then(el => el.setValue(filter));
    }
}

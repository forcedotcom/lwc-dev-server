import Page from './Page';

class HomePage implements Page {
    private container: WebdriverIO.Element | undefined;

    public async open() {
        await browser.url(`http://localhost:${global.serverPort}`);
        let self = this;
        return browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-home'))
            .then(el => (self.container = el));
    }

    public get containerList(): Promise<WebdriverIO.Element> {
        if (this.container) {
            return Promise.resolve(this.container.shadow$('.component-list'));
        }
        throw new Error('container not initialized first, call open() first');
    }

    protected get filterInput(): Promise<WebdriverIO.Element> {
        if (this.container) {
            return Promise.resolve(
                this.container.shadow$('input[name="component-filter"]')
            );
        }
        throw new Error('container not initialized first, call open() first');
    }

    public async filter(filter: string) {
        return this.filterInput.then(el => el.setValue(filter));
    }
}

export default new HomePage();

import Page from './Page';

class HomePage implements Page {
    async open() {
        await browser.url(`http://localhost:${global.serverPort}`);
    }

    get container(): Promise<WebdriverIO.Element> {
        const container = browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-home'));

        return container;
    }

    get containerList(): Promise<WebdriverIO.Element> {
        return this.container.then(container => {
            return container.shadow$('.component-list');
        });
    }
}

export default new HomePage();

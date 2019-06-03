import Page from './Page';

declare global {
    namespace NodeJS {
        interface Global {
            serverPort?: number;
        }
    }
}

class HomePage implements Page {
    async open() {
        await browser.url(`http://localhost:${global.serverPort}`);
    }

    async getContainer() {
        const container = await browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-home'));

        return container;
    }

    async getComponentList() {
        const container = await this.getContainer();
        return await container.shadow$('.component-list');
    }
}

export default new HomePage();

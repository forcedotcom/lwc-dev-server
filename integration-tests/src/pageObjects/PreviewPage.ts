import Page from './Page';
import decamelize from 'decamelize';

export default class PreviewPage implements Page {
    private container: WebdriverIO.Element | undefined;
    private namespace: string;
    private name: string;

    /**
     * Base PreviewPage for a specific component.
     *
     * @param namespace The component namespace.
     * @param name The component name in **camelCase**.
     */
    constructor(namespace: string, name: string) {
        this.namespace = namespace;
        this.name = name;
    }

    public async open() {
        await browser.url(
            `http://localhost:${global.serverPort}/lwc/preview/${
                this.namespace
            }/${this.name}`
        );
        return browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-preview'))
            .then(el => (this.container = el));
    }

    public get testComponent() {
        if (this.container) {
            const webComponentName = decamelize(this.name, '-');
            return Promise.resolve(
                this.container.shadow$(`${this.namespace}-${webComponentName}`)
            );
        }
        throw new Error('container not initialized first, call open() first');
    }

    public get lightningIcon() {
        return this.testComponent.then(el => el.shadow$('lightning-icon'));
    }

    public get lightningIconHref() {
        return this.lightningIcon
            .then(el => el.shadow$('lightning-primitive-icon'))
            .then(el => el.shadow$('use'))
            .then(el => el.getAttribute('xlink:href'));
    }
}

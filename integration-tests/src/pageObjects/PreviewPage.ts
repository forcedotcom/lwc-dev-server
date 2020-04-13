import Page from './Page';
import decamelize from 'decamelize';

export default class PreviewPage implements Page {
    private _container: WebdriverIO.Element | undefined;
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
            `http://localhost:${global.serverPort}/preview/${this.namespace}/${this.name}`
        );

        return this.container;
    }

    public get container() {
        return (
            browser
                .$('localdevserver-app')
                .then(el => el.shadow$('localdevserver-layout'))
                .then(el => el.$('localdevserver-view'))
                .then(el => el.shadow$('localdevserver-dynamic'))
                .then(el => el.shadow$('localdevserver-layout-section'))
                // .then(el => el.shadow$('localdevserver-dynamic'))
                .then(el => (this._container = el))
        );
    }

    public get testComponent() {
        if (this._container) {
            // const webComponentName = decamelize(this.name, '-');
            //return Promise.resolve(
            //this._container.shadow$(`${this.namespace}-${webComponentName}`)
            return this._container.$('localdevserver-dynamic');
            //);
        }
        throw new Error('container not initialized first, call open() first');
    }
}

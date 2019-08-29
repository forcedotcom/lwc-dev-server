import PreviewPage from '../pageObjects/PreviewPage';

export default class ApexPage extends PreviewPage {
    constructor(namespace: string, name: string) {
        super(namespace, name);
    }

    public get input(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$('lightning-input'))
            .then(el => el.shadow$('input'));
    }

    public get actionButton(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$('lightning-button.action'))
            .then(el => el.shadow$('button'));
    }

    public get contactsContainer(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$('.contacts'))
            .then(async el => {
                await el.waitForDisplayed(30000);
                return el;
            });
    }

    public get allContacts(): Promise<WebdriverIO.Element[]> {
        return this.contactsContainer.then(el => el.$$('.contact'));
    }

    public get singleContact(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(el => el.$('.contact'))
            .then(async el => {
                await el.waitForDisplayed(30000);
                return el;
            });
    }

    public async nameField(
        contact: WebdriverIO.Element
    ): Promise<WebdriverIO.Element> {
        return contact.$('.name');
    }

    public async titleField(
        contact: WebdriverIO.Element
    ): Promise<WebdriverIO.Element> {
        return contact.$('.title');
    }

    public async emailField(
        contact: WebdriverIO.Element
    ): Promise<WebdriverIO.Element> {
        return contact.$('lightning-formatted-email');
    }
}

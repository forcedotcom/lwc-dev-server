import PreviewPage from '../pageObjects/PreviewPage';

export default class ApexPage extends PreviewPage {
    constructor(namespace: string, name: string) {
        super(namespace, name);
    }

    public get contactsContainer(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('.contacts'))
            .then(async el => {
                await el.waitForDisplayed(
                    30000,
                    false,
                    "The element '.contacts' was not displayed on the page within the given timeout."
                );
                return el;
            });
    }

    public get allContacts(): Promise<WebdriverIO.Element[]> {
        return this.contactsContainer.then(el => el.$$('.contact'));
    }

    public get singleContact(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('.contact'))
            .then(async el => {
                await el.waitForDisplayed(
                    30000,
                    false,
                    "The element '.contact' was not displayed on the page within the given timeout."
                );
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

    public get input(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('lightning-input'))
            .then(el => el.shadow$('input'));
    }

    public get actionButton(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('lightning-button.action'))
            .then(el => el.shadow$('button'));
    }

    public get updateMarker(): Promise<WebdriverIO.Element> {
        return this.testComponent
            .then(el => el.shadow$('.update-marker'))
            .then(async el => {
                await el.waitForDisplayed(
                    30000,
                    false,
                    "The element '.update-marker' was not displayed on the page within the given timeout."
                );
                return el;
            });
    }
}

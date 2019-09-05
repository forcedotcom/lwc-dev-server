import PreviewPage from '../pageObjects/PreviewPage';

class CRUDPage extends PreviewPage {
    private _recordId: string | null = null;

    public constructor() {
        super('c', 'crud');
    }

    public get recordId(): string {
        return this._recordId || '';
    }

    public get wiredName(): Promise<WebdriverIO.Element> {
        return this.testComponent.then(async el => {
            const wiredName = await el.shadow$('.wired-name');
            await wiredName.waitForDisplayed(
                20000,
                false,
                'Timed out waiting for wired name to become visible'
            );
            return wiredName;
        });
    }

    public async setValue(value: string) {
        return this.testComponent
            .then(e => e.shadow$('.create-input'))
            .then(el => el.shadow$('input'))
            .then(input => input.setValue(value));
    }

    public async createRecord() {
        return this.testComponent
            .then(el => el.shadow$('.create-btn'))
            .then(createBtn => createBtn.shadow$('button'))
            .then(e => e.click())
            .then(() => this.testComponent)
            .then(async el => {
                await browser.waitUntil(
                    async () => {
                        const content = await Promise.resolve(
                            el.shadow$('.created-record .record-id')
                        ).then(e => e.getText());
                        return !!content;
                    },
                    20000,
                    'Timed out waiting for recordId to be set during CRUDPage.createRecord'
                );

                const currentId = await Promise.resolve(
                    el.shadow$('.created-record .record-id')
                ).then(spanEl => spanEl.getText());

                this._recordId = currentId;
                return currentId;
            });
    }

    public async editItem(value: string) {
        return this.testComponent
            .then(el => el.shadow$('.edit-input'))
            .then(el => el.shadow$('input'))
            .then(el => el.setValue(value))
            .then(() => this.testComponent)
            .then(el => el.shadow$('.edit-btn'))
            .then(el => el.click())
            .then(() => this.testComponent)
            .then(async el => {
                await browser.waitUntil(
                    async () => {
                        const content = await Promise.resolve(
                            el.shadow$('.created-record .record-name')
                        ).then(e => e.getText());
                        return !!content && content === value;
                    },
                    20000,
                    'Timed out waiting for data to be updated during CRUDPage.editItem'
                );
            });
    }

    public async deleteItem() {
        return this.testComponent
            .then(el => el.shadow$('.delete-btn'))
            .then(el => el.click())
            .then(() => this.testComponent)
            .then(async el => {
                const lastDelete = await el.shadow$('.last-delete');
                await lastDelete.waitForDisplayed(
                    20000,
                    false,
                    'Timed out waiting for data to be deleted during CRUDPage.deleteItem'
                );
            });
    }
}

export default new CRUDPage();

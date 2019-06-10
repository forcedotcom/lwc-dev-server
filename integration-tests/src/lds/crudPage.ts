import PreviewPage from '../pageObjects/PreviewPage';
import { Element } from 'webdriverio';

export default class CRUDPage extends PreviewPage {
    private _recordId: string | null = null;

    public constructor() {
        super('c', 'crud');
    }

    public async setValue(value: string) {
        return this.testComponent
            .then(e => e.shadow$('.name-input'))
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
                await browser.waitUntil(async () => {
                    const content = await Promise.resolve(
                        el.shadow$('span.recordId')
                    ).then(e => e.getText());
                    return !!content && content != 'not-set';
                });
                const currentId = await Promise.resolve(
                    el.shadow$('span.recordId')
                ).then(spanEl => spanEl.getText());
                this._recordId = currentId;
                return currentId;
            });
    }

    public get recordId(): string {
        return this._recordId || '';
    }

    public async editItem(value: string) {
        return this.testComponent
            .then(el => el.shadow$('.value-input'))
            .then(el => el.shadow$('input'))
            .then(el => el.setValue(value))
            .then(() => this.testComponent)
            .then(el => el.shadow$('.edit-btn'))
            .then(el => el.click())
            .then(() => this.testComponent)
            .then(async el => {
                await browser.waitUntil(async () => {
                    const content = await Promise.resolve(
                        el.shadow$('.data')
                    ).then(e => e.getText());
                    return !!content && content === value;
                });
            });
    }

    public async deleteItem() {
        return this.testComponent
            .then(el => el.shadow$('.delete-btn'))
            .then(el => el.click())
            .then(() => this.testComponent)
            .then(async el => {
                await browser.waitUntil(async () => {
                    const content = await Promise.resolve(
                        el.shadow$('.data')
                    ).then(e => e.getText());
                    return !!content && content === 'deleted';
                });
            });
    }
}

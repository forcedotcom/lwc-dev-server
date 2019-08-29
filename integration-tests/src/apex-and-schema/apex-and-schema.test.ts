/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

import path from 'path';
import { upload } from '../../utils/upload-metadata';
import PreviewPage from '../pageObjects/PreviewPage';
import debug from 'debug';

const log = debug('localdevserver:test');

beforeAll(async () => {
    const pkgPath = path.join(__dirname, 'project/force-app/main/default');
    await upload({
        packagePath: pkgPath,
        connection: global.jsforceConnection,
        apex: true
    });
});

describe('apex and schema', () => {
    it('wires to the property', async () => {
        const page = new PreviewPage('c', 'wireToProp');
        await page.open();

        await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(async el => {
                await browser.waitUntil(
                    async () => {
                        const content = await el.$$('.contacts p');
                        return content.length > 0;
                    },
                    30000,
                    'wire data did not update within timeout'
                );
                return el.$$('.contacts p');
            })
            .then(async contacts => {
                await Promise.all(
                    contacts.map(async contact => contact.getText())
                ).then(contacts => {
                    contacts.forEach(contact => {
                        log(`contact: ${contact}`);
                    });
                });
                expect(contacts).toHaveLength(10);
            });
    });

    it('imported schema fields work with wired apex data', async () => {
        const page = new PreviewPage('c', 'apexSchema');
        await page.open();

        await page.testComponent
            .then(el => el.shadow$('lightning-card'))
            .then(async el => {
                await browser.waitUntil(
                    async () => {
                        const contact = await el.$('.contact');
                        return await contact.isExisting();
                    },
                    30000,
                    'wire data did not update within timeout'
                );
                return el;
            })
            .then(async el => {
                const name = await Promise.resolve(el.$('.contact .name')).then(
                    el => el.getText()
                );
                const title = await Promise.resolve(
                    el.$('.contact .title')
                ).then(el => el.getText());

                const email = await Promise.resolve(
                    el.$('.contact lightning-formatted-email')
                ).then(el => el.getText());

                log(`name: ${name}`);
                log(`title: ${title}`);
                log(`email: ${email}`);

                expect(name).not.toBeFalsy();
                expect(title).not.toBeFalsy();
                expect(email).not.toBeFalsy();
            });
    });
});

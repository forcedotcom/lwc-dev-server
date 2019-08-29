/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

import path from 'path';
import { upload } from '../../utils/upload-metadata';
import ApexPage from './ApexPage';
import debug from 'debug';

const log = debug('localdevserver:test');

beforeAll(async () => {
    const packagePath = path.join(__dirname, 'project/force-app/main/default');
    await upload({
        packagePath,
        connection: global.jsforceConnection,
        apex: true
    });
});

describe('apex and schema', () => {
    it('wires to the property', async () => {
        const page = new ApexPage('c', 'wireToProp');
        await page.open();

        await page.allContacts.then(async contacts => {
            const contactNames = await Promise.all(
                contacts.map(contact => contact.getText())
            );

            expect(contactNames).toHaveLength(10);
        });
    });

    it('wires to the property with params', async () => {
        const page = new ApexPage('c', 'wireToPropParams');
        await page.open();

        const input = await page.input;
        await input.addValue('Rose Gonzalez');

        await page.allContacts.then(async contacts => {
            expect(contacts).toHaveLength(1);
            const name = await contacts[0].getText();
            expect(name).toBe('Rose Gonzalez');
        });
    });

    it.only('calls apex imperatively', async () => {
        const page = new ApexPage('c', 'apexImperative');
        await page.open();

        const button = await page.actionButton;
        await button.click();

        await page.allContacts.then(async contacts => {
            const contactNames = await Promise.all(
                contacts.map(contact => contact.getText())
            );

            expect(contactNames).toHaveLength(10);
        });
    });

    it('imported schema fields work with wired apex data', async () => {
        const page = new ApexPage('c', 'apexSchema');
        await page.open();

        await page.singleContact.then(async contact => {
            const name = await page.nameField(contact);
            const nameText = await name.getText();

            const title = await page.titleField(contact);
            const titleText = await title.getText();

            const email = await page.emailField(contact);
            const emailText = await email.getText();

            log(`schema - name: ${nameText}`);
            log(`schema - title: ${titleText}`);
            log(`schema - email: ${emailText}`);

            expect(nameText).not.toBeFalsy();
            expect(titleText).not.toBeFalsy();
            expect(emailText).not.toBeFalsy();
        });
    });
});

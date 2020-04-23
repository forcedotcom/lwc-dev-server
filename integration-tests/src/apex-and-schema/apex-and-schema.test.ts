/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

import path from 'path';
import { upload } from '../../utils/upload-metadata';
import ApexPage from './ApexPage';

beforeAll(async () => {
    const packagePath = path.join(__dirname, 'project/force-app/main/default');
    await upload({
        packagePath,
        connection: global.jsforceConnection,
        apex: true
    });
});

describe('apex', () => {
    it('can wire data to a property', async () => {
        const page = new ApexPage('c', 'wireToProp');
        await page.open();

        const allContacts = await page.allContacts;
        const contactNames = await Promise.all(
            allContacts.map(contact => contact.getText())
        );

        expect(contactNames).toHaveLength(10);
    });

    it('can wire data to a function with params', async () => {
        const page = new ApexPage('c', 'wireToFunctionWithParams');
        await page.open();

        const input = await page.input;
        await input.addValue('Rose Gonzalez');

        // wait for page to update
        await browser.waitUntil(
            async () => {
                const allContacts = await page.allContacts;
                return allContacts.length === 1; // just Rose Gonzalez
            },
            20000,
            'Expected the page to update matching the seach query.'
        );

        const allContacts = await page.allContacts;
        const contactName = await allContacts[0].getText();

        expect(contactName).toBe('Rose Gonzalez');
    });

    it('can be called imperatively', async () => {
        const page = new ApexPage('c', 'apexImperative');
        await page.open();

        const button = await page.actionButton;
        await button.click();

        const allContacts = await page.allContacts;
        const contactNames = await Promise.all(
            allContacts.map(contact => contact.getText())
        );

        expect(contactNames).toHaveLength(10);
    });

    it('wired data can be used with imported schema fields', async () => {
        const page = new ApexPage('c', 'apexSchema');
        await page.open();

        await page.singleContact.then(async contact => {
            const name = await page.nameField(contact);
            const nameText = await name.getText();

            const title = await page.titleField(contact);
            const titleText = await title.getText();

            const email = await page.emailField(contact);
            const emailText = await email.getText();

            expect(nameText).not.toBeFalsy();
            expect(titleText).not.toBeFalsy();
            expect(emailText).not.toBeFalsy();
        });
    });
});

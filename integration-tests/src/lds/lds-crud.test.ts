/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

import CRUDPage from './crudPage';
import { QueryResult } from 'jsforce';
import debug from 'debug';

const log = debug('localdevserver:test');

describe('Lightning data service CRUD proxies to the org', () => {
    it.skip('Create, Read, Edit, Delete an Account object via LDS', async () => {
        await CRUDPage.open();

        const conn = global.jsforceConnection;

        // test create
        let name = `CRUDTest ${Date.now()}`;
        await CRUDPage.setValue(name);

        const recordId = await CRUDPage.createRecord();
        log(`recordId is ${recordId}`);
        try {
            const result: QueryResult<any> = await conn.query(
                `select Name from Account where Id='${recordId}'`
            );
            expect(result.records[0].Name).toBe(name);
        } catch (e) {
            throw new Error(
                `Reading data after create resulted in an error: ${e}`
            );
        }

        // test edit
        name = `edited ${name}`;
        await CRUDPage.editItem(name);
        try {
            const result: QueryResult<any> = await conn.query(
                `select Name from Account where Id='${recordId}'`
            );
            expect(result.records[0].Name).toBe(name);
        } catch (e) {
            throw new Error(
                `Reading data after edit resulted in an error: ${e}`
            );
        }

        // test read (wired getRecord)
        await browser.waitUntil(
            async () => {
                const wiredNameEl = await CRUDPage.wiredName;
                const wiredName = await wiredNameEl.getText();
                return wiredName === name;
            },
            10000,
            'Timed out waiting for the wiredName to matched the updated value'
        );

        // test delete
        await CRUDPage.deleteItem();
        try {
            const result: QueryResult<any> = await conn.query(
                `select Name from Account where Id='${recordId}'`
            );
            expect(result.records.length).toBe(0);
        } catch (e) {
            throw new Error(
                `Reading data after delete resulted in an error: ${e}`
            );
        }
    });
});

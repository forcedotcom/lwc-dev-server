/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

import CRUDPage from './crudPage';
import { QueryResult } from 'jsforce';

describe('Lightning data service CRUD proxies to the org', () => {
    it('Create, ~Read~, Edit, Delete an Account object via SLDS', async () => {
        const page = new CRUDPage();
        await page.open();
        let name = `CRUDTest ${Date.now()}`;
        await page.setValue(name);
        const recordId = await page.createRecord();

        console.log(`recordId is ${recordId}`);
        return new Promise((resolve, reject) => {
            global.jsforceConnection.query(
                `select Name from Account where Id='${recordId}'`,
                {},
                (err: Error, result: QueryResult<any>) => {
                    if (err) {
                        reject(err);
                    } else {
                        expect(result.records[0].Name).toBe(name);
                        resolve();
                    }
                }
            );
        })
            .then(async () => {
                name = `edited ${name}`;
                await page.editItem(name);
                return new Promise((resolve, reject) => {
                    global.jsforceConnection.query(
                        `select Name from Account where Id='${recordId}'`,
                        {},
                        (err: Error, result: QueryResult<any>) => {
                            if (err) {
                                reject(err);
                            } else {
                                expect(result.records[0].Name).toBe(name);
                                resolve();
                            }
                        }
                    );
                });
            })
            .then(async () => {
                await page.deleteItem();
                return new Promise((resolve, reject) => {
                    global.jsforceConnection.query(
                        `select Name from Account where Id='${recordId}'`,
                        {},
                        (err: Error, result: QueryResult<any>) => {
                            if (err) {
                                reject(err);
                            } else {
                                expect(result.records.length).toBe(0);
                                resolve();
                            }
                        }
                    );
                });
            });
    });
});

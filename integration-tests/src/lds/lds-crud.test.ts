/**
 * @jest-environment ./environment/AuthenticatedEnvironment.js
 */

import CRUDPage from './crudPage';
import { QueryResult } from 'jsforce';

// currently disabled for windows until we get the Auth working
const testfn = it; //process.platform === 'win32' ? it.skip : it;
describe('Lightning data service CRUD proxies to the org', () => {
    testfn(
        'Create, ~Read~, Edit, Delete an Account object via LDS',
        async () => {
            await CRUDPage.open();
            let name = `CRUDTest ${Date.now()}`;
            await CRUDPage.setValue(name);
            const recordId = await CRUDPage.createRecord();

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
                    await CRUDPage.editItem(name);
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
                    await CRUDPage.deleteItem();
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
        }
    );
});

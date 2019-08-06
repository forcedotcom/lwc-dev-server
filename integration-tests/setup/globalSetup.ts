import { ChildProcess } from 'child_process';
import selenium from 'selenium-standalone';
import { KeychainConfig } from '@salesforce/core/lib/config/keychainConfig';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
        }
    }
}

module.exports = async () => {
    debugger;
    // If windows, setup our key.json file
    if (process.platform === 'win32' && process.env.SFDC_KEY) {
        let newKeyChain = await KeychainConfig.create(
            KeychainConfig.getDefaultOptions()
        );
        let keychainPath = newKeyChain.getPath();
        newKeyChain.write({
            service: 'sfdx',
            account: 'local',
            key: process.env.SFDC_KEY
        });
    }

    // Install Selenium if required.
    const seleniumOptions: any = {
        version: '3.9.1',
        baseURL: 'https://selenium-release.storage.googleapis.com',
        drivers: {
            chrome: {
                version: '75.0.3770.90',
                arch: process.arch,
                baseURL: 'https://chromedriver.storage.googleapis.com'
            }
        }
    };
    await new Promise(resolve => {
        selenium.install(seleniumOptions, resolve);
    });
    // Start Selenium server.
    global.seleniumProcess = await new Promise<ChildProcess>(
        (resolve, reject) =>
            selenium.start(seleniumOptions, (error: any, childProcess: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(childProcess);
                }
            })
    );
};

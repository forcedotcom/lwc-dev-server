import { ChildProcess } from 'child_process';
import selenium from 'selenium-standalone';
import { KeychainConfig } from '@salesforce/core/lib/config/keychainConfig';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
            _SFDX_DISABLE_TELEMETRY: string | undefined;
        }
    }
}

module.exports = async () => {
    // Install Selenium if required.
    const seleniumOptions: any = {
        version: '3.9.1',
        baseURL: 'https://selenium-release.storage.googleapis.com',
        drivers: {
            chrome: {
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

    // Disable Instrumentation sending actual log lines during test runs
    global._SFDX_DISABLE_TELEMETRY = process.env.SFDX_DISABLE_TELEMETRY;
    process.env.SFDX_DISABLE_TELEMETRY = 'true';
};

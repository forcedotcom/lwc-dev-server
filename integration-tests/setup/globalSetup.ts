import { ChildProcess } from 'child_process';
import selenium from 'selenium-standalone';
import { KeychainConfig } from '@salesforce/core/lib/config/keychainConfig';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
            _SFDX_DISABLE_INSIGHTS: string | undefined;
        }
    }
}

module.exports = async () => {
    // If we are on windows, allow CI to setup our key.json file so the windows keystore won't break the tests.
    // Without this, we get an error if the keychain hasn't been setup already (through a previous sfdx force:auth:web:login):
    // 'GenericKeychainServiceError: The service and account specified in key.json do not match the version of the toolbelt.'
    if (process.platform === 'win32' && process.env.SFDC_KEY) {
        let newKeyChain = await KeychainConfig.create(
            KeychainConfig.getDefaultOptions()
        );
        let keychainPath = newKeyChain.getPath();
        await newKeyChain.write({
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
                // Load this URL to get the latest version.
                // https://chromedriver.storage.googleapis.com/LATEST_RELEASE
                version: '80.0.3987.106',
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
    global._SFDX_DISABLE_INSIGHTS = process.env.SFDX_DISABLE_INSIGHTS;
    process.env.SFDX_DISABLE_INSIGHTS = 'true';
};

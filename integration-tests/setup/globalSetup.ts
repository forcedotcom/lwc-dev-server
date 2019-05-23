import { ChildProcess } from 'child_process';
import selenium from 'selenium-standalone';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
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
                version: '74.0.3729.6',
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

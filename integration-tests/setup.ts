import { ChildProcess } from 'child_process';
import selenium from 'selenium-standalone';
import { remote } from 'webdriverio';

jest.setTimeout(60000);

declare global {
    namespace NodeJS {
        interface Global {
            browser: typeof browser;
            $: typeof $;
            $$: typeof $$;
        }
    }
}

let seleniumProcess: ChildProcess;

beforeAll(async () => {
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
    seleniumProcess = await new Promise<ChildProcess>((resolve, reject) =>
        selenium.start(seleniumOptions, (error: any, childProcess: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(childProcess);
            }
        })
    );
});

afterAll(async () => {
    // // Kill Selenium server.
    await seleniumProcess.kill();
});

beforeEach(async () => {
    // Configure the browser via BROWSER_NAME environment variable.
    // Setting HEADLESS to 1 will run the browser in headless mode (only available on Chrome).
    const browser: BrowserObject = await remote({
        capabilities: {
            browserName: process.env.BROWSER_NAME || 'chrome',
            'goog:chromeOptions': {
                w3c: 'true',
                args:
                    process.env.HEADLESS === 'false'
                        ? []
                        : [
                              '--headless',
                              '--disable-gpu',
                              '--window-size=1280,800'
                          ]
            }
        }
    });
    global.browser = browser;
    global.$ = browser.$;
    global.$$ = browser.$$;
});

afterEach(async () => {
    await global.browser.deleteSession();
});

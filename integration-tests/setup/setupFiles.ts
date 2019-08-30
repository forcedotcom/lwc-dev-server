import { remote, BrowserObject } from 'webdriverio';
import { Circus } from '@jest/types';
import path from 'path';
import fs from 'fs';
import shell from 'shelljs';

const debug = process.env.DEBUG;

jest.setTimeout(debug ? 24 * 60 * 60 * 1000 : 60000);

declare global {
    namespace NodeJS {
        interface Global {
            browser: typeof browser;
            $: typeof $;
            $$: typeof $$;
        }
    }
}

beforeEach(async () => {
    // Configure the browser via BROWSER_NAME environment variable.
    // Setting HEADLESS to not be "false" will run the browser in headless mode for chrome.
    const browser: BrowserObject = await remote({
        capabilities: {
            browserName: process.env.BROWSER_NAME || 'chrome',
            'goog:chromeOptions': {
                // @ts-ignore
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
        },
        logLevel: 'warn'
    });
    global.browser = browser;
    global.$ = browser.$;
    global.$$ = browser.$$;
    global.failedTest = undefined;
});

afterEach(async () => {
    // hacky way to save screenshots for failures...
    // the screenshot needs to happen before browser.deleteSession
    // but jest doesn't provide test info/state info to afterEach.
    const test = global.failedTest;
    if (test) {
        console.log('attempting to save screenshot for test failure');

        try {
            const screenshot = await global.browser.takeScreenshot();
            let screenshotName = test.name;
            let parent: Circus.DescribeBlock | null | undefined = test.parent;
            while (parent) {
                const parentName = parent.name;
                if (parentName !== 'ROOT_DESCRIBE_BLOCK') {
                    screenshotName = `${parentName} - ${screenshotName}`;
                }
                parent = parent.parent;
            }
            screenshotName = `${screenshotName} - ${new Date().getTime()}.png`;

            const screenshotsPath = path.join(
                __dirname,
                '..',
                '..',
                'errorShots'
            );
            const screenshotPath = path.join(screenshotsPath, screenshotName);

            shell.mkdir('-p', screenshotsPath);
            fs.writeFileSync(screenshotPath, screenshot, 'base64');
            console.log(`screenshot saved at ${screenshotPath}`);
        } catch (e) {
            console.error(`error taking screenshot: ${e}`);
        }
    }

    await global.browser.deleteSession();
});

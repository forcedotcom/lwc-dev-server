import { remote } from 'webdriverio';

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
        }
    });
    global.browser = browser;
    global.$ = browser.$;
    global.$$ = browser.$$;
});

afterEach(async () => {
    await global.browser.deleteSession();
});

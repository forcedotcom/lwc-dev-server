/**
 * @jest-environment ./environment/CliEnvironment.js
 * @command force:lightning:lwc:start
 */

describe('CLI Example', () => {
    it('opens the home page', async () => {
        await browser.url(`http://localhost:${global.serverPort}`);

        const container = await browser
            .$('talon-app')
            .then(el => el.shadow$('localdevserver-layout'))
            .then(el => el.$('talon-router-container'))
            .then(el => el.shadow$('localdevserver-home'));

        const list = await container.shadow$('.component-list');
        const text = await list.getText();

        expect(text).toBe('test-hello');
    });
});

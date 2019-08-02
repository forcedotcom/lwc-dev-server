const thirdStep = 'lightning-progress-step.step3';

describe('progress-indicator type="base"', () => {
    before(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });
    it('should show the tooltip when hover the step', () => {
        const firstStep = 'lightning-progress-step';
        const tooltip = 'div[role="tooltip"]';
        $(firstStep).moveTo();
        browser.waitUntil(() => $(tooltip).isDisplayed());
    });
    it('should hide the tooltip when mouse leave the step', () => {
        const firstStep = 'lightning-progress-step';
        const tooltip = 'div[role="tooltip"]';
        $(firstStep).moveTo();
        $(firstStep).moveTo(100, 100);
        browser.waitUntil(() => !$(tooltip).isDisplayed());
    });
    it('should show the tooltip when the step gets focus', () => {
        const firstStep = 'lightning-progress-step';
        const tooltip = 'div[role="tooltip"]';
        $(firstStep).click();
        browser.waitUntil(() => $(tooltip).isDisplayed());
    });
    it('should hide the tooltip when blur the step', () => {
        const firstStep = 'lightning-progress-step';
        const tooltip = 'div[role="tooltip"]';
        const body = 'body';
        $(firstStep).click();
        $(body).click();
        browser.waitUntil(() => !$(tooltip).isDisplayed());
    });
    it('should have the active class on the current step', () => {
        const step3 = '.step3';
        browser.waitUntil(() => {
            const classNames = $(step3).getAttribute('class');
            return classNames.indexOf('slds-is-active') !== -1;
        });
    });
    it('should move to next step click in the next button', () => {
        const step3 = '.step3';
        $('lightning-button').click();
        browser.waitUntil(() => {
            const classNames = $(step3).getAttribute('class');
            return classNames.indexOf('slds-is-completed') !== -1;
        });
    });
});

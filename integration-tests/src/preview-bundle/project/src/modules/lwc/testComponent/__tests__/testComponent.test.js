import { createElement } from 'lwc';
import TestComponent from 'c/testComponent';

describe('c-testComponent', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays greeting', () => {
        // Create element
        const element = createElement('c-test-component', {
            is: TestComponent
        });
        document.body.appendChild(element);

        // Verify displayed greeting
        const div = element.shadowRoot.querySelector('div');
        expect(div.textContent).toBe('Hello, World!');
    });
});

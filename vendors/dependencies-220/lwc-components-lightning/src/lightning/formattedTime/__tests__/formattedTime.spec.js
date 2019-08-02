import { createElement } from 'lwc';
import Element from 'lightning/formattedTime';

const createFormattedTimeComponent = () => {
    const element = createElement('lightning-formatted-time', {
        is: Element,
    });
    document.body.appendChild(element);
    return element;
};

const getText = element => {
    return element.shadowRoot.textContent;
};

describe('lightning-formatted-time', () => {
    it('default by not passing any value', () => {
        const element = createFormattedTimeComponent();
        expect(element).toMatchSnapshot();
    });

    it('defaults to the US time format', () => {
        const element = createFormattedTimeComponent();
        element.value = '22:12:30.999Z';
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('10:12:30 PM');
        });
    });

    it('Morning time', () => {
        const element = createFormattedTimeComponent();
        element.value = '02:12:30.999Z';
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('2:12:30 AM');
        });
    });

    it('Value without Z suffix', () => {
        const element = createFormattedTimeComponent();
        element.value = '02:12:30.999';
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('2:12:30 AM');
        });
    });

    it('Empty value', () => {
        const element = createFormattedTimeComponent();
        element.value = '';
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
});

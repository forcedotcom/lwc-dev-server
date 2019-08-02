import { createElement } from 'lwc';
import Element from 'lightning/relativeDateTime';

const createRelativeDateTime = value => {
    const element = createElement('lightning-relative-date-time', {
        is: Element,
    });
    element.value = value;
    document.body.appendChild(element);
    return element;
};

const getText = element => {
    return element.shadowRoot.textContent;
};

describe('lightning-relative-date-time', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('should throw when invalid value provided', () => {
        const elem = createRelativeDateTime();
        expect(() => {
            elem.value = 'not valid value';
        }).toThrow();
    });

    it('should change formattedValue with time', () => {
        jest.clearAllTimers();
        const element = createRelativeDateTime(Date.now());
        jest.runOnlyPendingTimers();
        expect(getText(element)).toBe('a few seconds ago');
    });

    it('should change formattedValue after a few minutes', () => {
        jest.clearAllTimers();

        const now = Date.now();
        const element = createRelativeDateTime(Date.now());

        // advance time by 10 minutes
        const addMinutes = 10 * 60 * 1000;
        jest.spyOn(Date, 'now').mockImplementation(() => now + addMinutes);
        jest.advanceTimersByTime(addMinutes);

        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('10 minutes ago');
        });
    });

    it('should change formattedValue after a few hours', () => {
        jest.clearAllTimers();

        const now = Date.now();
        const element = createRelativeDateTime(Date.now());

        // advance time by 5 hours
        const addMinutes = 5 * 60 * 60 * 1000;
        jest.spyOn(Date, 'now').mockImplementation(() => now + addMinutes);
        jest.advanceTimersByTime(addMinutes);

        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('5 hours ago');
        });
    });

    it('should change formattedValue after a few days', () => {
        jest.clearAllTimers();

        const now = Date.now();
        const element = createRelativeDateTime(Date.now());

        // advance time by 23 days
        const addMinutes = 23 * 24 * 60 * 60 * 1000;
        jest.spyOn(Date, 'now').mockImplementation(() => now + addMinutes);
        jest.advanceTimersByTime(addMinutes);

        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('23 days ago');
        });
    });
});

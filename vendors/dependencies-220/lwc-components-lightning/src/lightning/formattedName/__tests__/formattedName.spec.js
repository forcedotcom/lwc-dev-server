import { createElement } from 'lwc';
import Element from 'lightning/formattedName';
import { getLocaleTag } from '../../internationalizationLibrary/localeUtils';

const defaultAttributes = {
    salutation: 'Mr.',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Middleton',
    informalName: 'Jo',
    suffix: 'The 3rd',
};

const createFormattedNameComponent = params => {
    const element = createElement('lightning-formatted-name', {
        is: Element,
    });
    Object.assign(element, defaultAttributes, params);
    document.body.appendChild(element);
    return element;
};

const getText = element => {
    return element.shadowRoot.textContent;
};

jest.mock('../../internationalizationLibrary/localeUtils', () => ({
    getLocaleTag: jest.fn(),
}));

describe('lightning-formatted-name', () => {
    beforeEach(() => {
        getLocaleTag.mockReturnValue('en-US');
    });

    it('default by not passing any value', () => {
        const element = createFormattedNameComponent();
        expect(element).toMatchSnapshot();
    });

    it('defaults to en_US order and long format', () => {
        const element = createFormattedNameComponent();
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('Mr. John Middleton Doe The 3rd Jo');
        });
    });

    it('Name with short format', () => {
        const element = createFormattedNameComponent();
        element.format = 'short';
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('John Doe');
        });
    });

    it('Name with medium format', () => {
        const element = createFormattedNameComponent();
        element.format = 'medium';
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('John Middleton Doe');
        });
    });

    it('full name with ja_JP order', () => {
        getLocaleTag.mockReturnValue('ja-JP');
        const element = createFormattedNameComponent();
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('Doe Middleton John The 3rd Jo');
        });
    });

    it('full name with only locale set to language - ja', () => {
        getLocaleTag.mockReturnValue('ja');
        const element = createFormattedNameComponent();
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('Doe Middleton John The 3rd Jo');
        });
    });
});

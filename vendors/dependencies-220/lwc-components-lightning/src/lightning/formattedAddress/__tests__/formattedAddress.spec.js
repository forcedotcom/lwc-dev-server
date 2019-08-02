import { createElement } from 'lwc';
import Element from 'lightning/formattedAddress';
import { getLocaleTag } from '../../internationalizationLibrary/localeUtils';

const defaultAttributes = {
    street: '121 Spear St.',
    city: 'San Francisco',
    country: 'US',
    province: 'CA',
    postalCode: '94105',
};

const createFormattedAddress = params => {
    const element = createElement('lightning-formatted-address', {
        is: Element,
    });
    Object.assign(element, defaultAttributes, params);
    document.body.appendChild(element);
    return element;
};

const getText = element => {
    return element.shadowRoot.textContent;
};

const getLink = element => {
    return element.shadowRoot.querySelector('a');
};

jest.mock('../../internationalizationLibrary/localeUtils', () => ({
    getLocaleTag: jest.fn(),
}));

describe('formatted-address', () => {
    beforeEach(() => {
        getLocaleTag.mockReturnValue('cn-CN');
    });

    it('format address based on locale', () => {
        const element = createFormattedAddress();
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('disabled formatted-address has no link', () => {
        const element = createFormattedAddress({
            disabled: true,
        });
        return Promise.resolve().then(() => {
            expect(getLink(element)).toBeNull();
        });
    });

    it('uses latitude and longitude for title and url if both exist', () => {
        const element = createFormattedAddress({
            latitude: '123',
            longitude: '456',
        });
        return Promise.resolve().then(() => {
            const link = getLink(element);
            expect(link.href).toBe('https://www.google.com/maps/?q=123,456');
            expect(link.title).toBe('123,456');
        });
    });

    it('does not use latitude and longitude for title and url if latitude does not exist', () => {
        const element = createFormattedAddress({
            longitude: '456',
        });
        return Promise.resolve().then(() => {
            const link = getLink(element);
            expect(link.href).toBe(
                'https://www.google.com/maps/?q=121%20Spear%20St.%0ASan%20Francisco,%20CA%2094105%0AUS'
            );
            expect(link.title.replace(/\n/g, ' ')).toBe(
                '121 Spear St. San Francisco, CA 94105 US'
            );
        });
    });

    it('does not use latitude and longitude for title and url if longitude does not exist', () => {
        const element = createFormattedAddress({
            latitude: '123',
        });
        return Promise.resolve().then(() => {
            const link = getLink(element);
            expect(link.href).toBe(
                'https://www.google.com/maps/?q=121%20Spear%20St.%0ASan%20Francisco,%20CA%2094105%0AUS'
            );
            expect(link.title.replace(/\n/g, ' ')).toBe(
                '121 Spear St. San Francisco, CA 94105 US'
            );
        });
    });

    it('formats correctly for en_US locale', () => {
        getLocaleTag.mockReturnValue('en-US');
        const element = createFormattedAddress();
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe(
                '121 Spear St.San Francisco, CA 94105US'
            );
        });
    });

    it('formats correctly for japan locale', () => {
        getLocaleTag.mockReturnValue('ja-JP');
        const element = createFormattedAddress();
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe(
                '121 Spear St.San Francisco CA94105 US'
            );
        });
    });

    it('formats correctly for japan locale when the address contains Han characters', () => {
        getLocaleTag.mockReturnValue('ja-JP');
        const element = createFormattedAddress({
            street: '郵便局 #1',
            country: '日本',
            city: 'Tokyo',
            province: '',
            postalCode: '123456',
        });
        return Promise.resolve().then(() => {
            expect(getText(element)).toBe('日本〒123456Tokyo郵便局 #1');
        });
    });

    it('shows plain text when toggling disabled to true', () => {
        const element = createFormattedAddress();
        element.disabled = true;
        return Promise.resolve().then(() => {
            expect(getLink(element)).toBeNull();
        });
    });

    it('has correct target and rel attributes', () => {
        const element = createFormattedAddress();
        return Promise.resolve().then(() => {
            const link = getLink(element);
            expect(link.target).toBe('_blank');
            expect(link.rel).toBe('noopener');
        });
    });
});

import { address as addressFormat } from './../address/AddressFormat';

const addressObject = {
    address: 'Street',
    city: 'City',
    state: 'State',
    country: 'Country',
    zipCode: 'ZipCode',
};

const incompleteAddress = {
    address: 'Street',
    city: 'City',
    country: 'Country',
};

describe('When using the address formatter for en-US', () => {
    const langCode = 'en';
    const countryCode = 'US';

    it('should correctly format an address object', () => {
        const formattedAddress = addressFormat.formatAddressAllFields(
            langCode,
            countryCode,
            addressObject,
            ' '
        );

        expect(formattedAddress).toBe('Street City, State ZipCode Country');
    });
    it('should correctly format an incomplete address object', () => {
        const formattedAddress = addressFormat.formatAddressAllFields(
            langCode,
            countryCode,
            incompleteAddress,
            ' '
        );

        expect(formattedAddress).toBe('Street City Country');
    });
    it('should return the correct required fields for the country', () => {
        expect(
            addressFormat.getAddressRequireFields(langCode, countryCode)
        ).toBe('ACSZ');
    });
});

describe('When using the address formatter for de_AT', () => {
    const langCode = 'de';
    const countryCode = 'AT';

    it('should correctly format an address object', () => {
        const formattedAddress = addressFormat.formatAddressAllFields(
            langCode,
            countryCode,
            addressObject,
            ' '
        );

        expect(formattedAddress).toBe('Street ZipCode City State Country');
    });
    it('should correctly format an incomplete address object', () => {
        const formattedAddress = addressFormat.formatAddressAllFields(
            langCode,
            countryCode,
            incompleteAddress,
            ' '
        );

        expect(formattedAddress).toBe('Street City Country');
    });
    it('should return the correct required fields for the country', () => {
        expect(
            addressFormat.getAddressRequireFields(langCode, countryCode)
        ).toBe('AZC');
    });
});

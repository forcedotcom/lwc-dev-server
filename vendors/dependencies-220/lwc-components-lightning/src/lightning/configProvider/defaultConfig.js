/* eslint eslint-comments/no-use: off */
/* eslint-disable lwc/no-aura */
import localizationService from './defaultLocalizationConfig';

function getConfigFromAura($A) {
    return {
        getFormFactor() {
            return $A.get('$Browser.formFactor');
        },
        getLocale() {
            return $A.get('$Locale');
        },
        getLocalizationService() {
            return $A.localizationService;
        },
        getPathPrefix() {
            return $A.getContext().getPathPrefix();
        },
        getToken(name) {
            return $A.getToken(name);
        },
        sanitizeDOM(dirty, config) {
            return $A.util.sanitizeDOM(dirty, config);
        },
    };
}

function createStandAloneConfig() {
    return {
        getFormFactor() {
            return 'DESKTOP';
        },
        getLocale() {
            return {
                userLocaleLang: 'en',
                userLocaleCountry: 'US',
                language: 'en',
                country: 'US',
                variant: '',
                langLocale: 'en_US',
                firstDayOfWeek: 1,
                timezone: 'America/Los_Angeles',
                isEasternNameStyle: false,
                dateFormat: 'MMM d, yyyy',
                shortDateFormat: 'M/d/yyyy',
                longDateFormat: 'MMMM d, yyyy',
                datetimeFormat: 'MMM d, yyyy h:mm:ss a',
                timeFormat: 'h:mm:ss a',
                numberFormat: '#,##0.###',
                decimal: '.',
                grouping: ',',
                zero: '0',
                percentFormat: '#,##0%',
                currencyFormat: '¤ #,##0.00;¤-#,##0.00',
                currencyCode: 'USD',
                currency: '$',
                dir: 'ltr',
            };
        },
        getLocalizationService() {
            return localizationService;
        },
        getPathPrefix() {
            return ''; // @sfdc.playground path-prefix DO-NOT-REMOVE-COMMENT
        },
        getToken(name) {
            return name; // @sfdc.playground token DO-NOT-REMOVE-COMMENT
        },
        getOneConfig() {
            return {
                densitySetting: '',
            };
        },
        // not defaulting `sanitizeDOM` dependency since we dont have a good alternative for now.
    };
}

export function getDefaultConfig() {
    return window.$A !== undefined && window.$A.localizationService
        ? getConfigFromAura(window.$A)
        : createStandAloneConfig();
}

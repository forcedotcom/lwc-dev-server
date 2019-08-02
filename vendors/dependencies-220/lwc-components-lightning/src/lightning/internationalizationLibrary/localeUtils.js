import { getLocale } from 'lightning/configProvider';

// returns a valid BCP47 tag based on the user’s locale setting
// This returns the locale tag similar to the lwc @salesforce/i18n/locale and should be replaced once we switch to lwc GVPs
// The aura locale GVPs are confusing, see the following doc for more details and their lwc equivalent:
// See https://salesforce.quip.com/M9sPA9xFnRgv
function getLocaleTag() {
    const localeLanguage = getLocale().userLocaleLang; // e.g. 'en'
    const localeCountry = getLocale().userLocaleCountry; // e.g. 'CA'

    if (!localeLanguage) {
        return getLocale().langLocale.replace(/_/g, '-'); // e.g. 'en_US' -> 'en-US'
    }

    // should return a valid BCP47 tag
    return localeLanguage + (localeCountry ? '-' + localeCountry : '');
}

export { getLocale, getLocaleTag };

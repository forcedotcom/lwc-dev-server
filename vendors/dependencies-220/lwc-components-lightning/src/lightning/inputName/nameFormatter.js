import {
    nameFormat,
    getLocaleTag,
} from 'lightning/internationalizationLibrary';

const FORMAT_CODE_MAP = {
    L: 'lastName',
    M: 'middleName',
    F: 'firstName',
    S: 'salutation',
    X: 'suffix',
    I: 'informalName',
};

export const parseFieldsFormat = function(format) {
    if (isValidLocaleFormat(format)) {
        return format
            .toUpperCase()
            .split(/(?=[A-Z])/)
            .map(formatCode => FORMAT_CODE_MAP[formatCode]);
    }
    return [];
};

export const getFieldsOrder = function() {
    const locale = getLocaleTag().replace(/-/g, '_');
    const inputOrder = parseFieldsFormat(nameFormat.getNameInputOrder(locale));
    return inputOrder;
};

function isValidLocaleFormat(value) {
    return typeof value === 'string' && /^[LMFSXI]+$/i.test(value);
}

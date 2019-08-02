import { getLocale } from '../localeUtils';
import {
    updateFractionPart,
    updateIntegerPart,
    updateCurrencySymbol,
    getCurrency,
} from './utils';

function NumberOptions(options) {
    this.locale = getLocale();
    this.options = options || {};
}

NumberOptions.prototype.isCurrency = function() {
    return this.options.style === 'currency';
};

NumberOptions.prototype.isPercent = function() {
    return this.options.style === 'percent';
};

NumberOptions.prototype.isDefaultCurrency = function() {
    return (
        !this.options.currency ||
        this.locale.currencyCode === this.options.currency
    );
};

NumberOptions.prototype.getDefaultSkeleton = function() {
    return this.isCurrency()
        ? this.locale.currencyFormat
        : this.isPercent()
            ? this.locale.percentFormat
            : this.locale.numberFormat;
};

NumberOptions.prototype.getSkeleton = function() {
    const options = this.options;
    const defaultSkeleton = this.getDefaultSkeleton();
    let skeleton = updateFractionPart(defaultSkeleton, options);
    skeleton = updateIntegerPart(skeleton, options);
    if (!this.isDefaultCurrency()) {
        skeleton = updateCurrencySymbol(
            skeleton,
            getCurrency(options),
            options
        );
    }
    return skeleton;
};

export { NumberOptions };

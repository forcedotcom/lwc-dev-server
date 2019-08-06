import { LightningElement, api } from 'lwc';
import { classSet } from 'lightning/utils';
import { normalizeString as normalize } from 'lightning/utilsPrivate';
import * as iconUtils from 'lightning/iconUtils';
import standardTemplate from './primitiveIcon.html';
import { getIconSvgTemplates, getLocale } from 'lightning/configProvider';

export default class LightningPrimitiveIcon extends LightningElement {
    @api iconName;
    @api src;
    @api svgClass;
    @api size = 'medium';
    @api variant;

    privateIconSvgTemplates = getIconSvgTemplates();

    get inlineSvgProvided() {
        return !!this.privateIconSvgTemplates;
    }

    renderedCallback() {
        if (this.iconName !== this.prevIconName && !this.inlineSvgProvided) {
            this.prevIconName = this.iconName;
            const svgElement = this.template.querySelector('svg');
            iconUtils.polyfill(svgElement);
            iconUtils.safariA11yPatch(svgElement);
        }
    }

    get href() {
        return (
            this.src ||
            iconUtils.getIconPath(this.iconName, getLocale && getLocale().dir)
        );
    }

    get name() {
        return iconUtils.getName(this.iconName);
    }

    get normalizedSize() {
        return normalize(this.size, {
            fallbackValue: 'medium',
            validValues: ['xx-small', 'x-small', 'small', 'medium', 'large'],
        });
    }

    get normalizedVariant() {
        // NOTE: Leaving a note here because I just wasted a bunch of time
        // investigating why both 'bare' and 'inverse' are supported in
        // lightning-primitive-icon. lightning-icon also has a deprecated
        // 'bare', but that one is synonymous to 'inverse'. This 'bare' means
        // that no classes should be applied. So this component needs to
        // support both 'bare' and 'inverse' while lightning-icon only needs to
        // support 'inverse'.
        return normalize(this.variant, {
            fallbackValue: '',
            validValues: ['bare', 'error', 'inverse', 'warning', 'success'],
        });
    }

    get computedClass() {
        const { normalizedSize, normalizedVariant } = this;
        const classes = classSet(this.svgClass);

        if (normalizedVariant !== 'bare') {
            classes.add('slds-icon');
        }

        switch (normalizedVariant) {
            case 'error':
                classes.add('slds-icon-text-error');
                break;
            case 'warning':
                classes.add('slds-icon-text-warning');
                break;
            case 'success':
                classes.add('slds-icon-text-success');
                break;
            case 'inverse':
            case 'bare':
                break;
            default:
                // if custom icon is set, we don't want to set
                // the text-default class
                if (!this.src) {
                    classes.add('slds-icon-text-default');
                }
        }

        if (normalizedSize !== 'medium') {
            classes.add(`slds-icon_${normalizedSize}`);
        }

        return classes.toString();
    }

    resolveTemplate() {
        const name = this.iconName;
        if (iconUtils.isValidName(name)) {
            const [spriteName, iconName] = name.split(':');
            const template = this.privateIconSvgTemplates[
                `${spriteName}_${iconName}`
            ];
            if (template) {
                return template;
            }
        }
        return standardTemplate;
    }

    render() {
        if (this.inlineSvgProvided) {
            return this.resolveTemplate();
        }
        return standardTemplate;
    }
}
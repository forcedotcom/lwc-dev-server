import { createElement } from 'lwc';
import Element from 'lightning/verticalNavigationItemIcon';

const createItem = () => {
    const element = createElement('lightning-vertical-navigation-item-icon', {
        is: Element,
    });
    document.body.appendChild(element);
    return element;
};

describe('lightning-vertical-navigation-item-icon', () => {
    it('should apply default classes and href', () => {
        const element = createItem();
        expect(element.className).toBe('slds-nav-vertical__item');
        expect(element.href).toBe('javascript:void(0);'); // eslint-disable-line no-script-url
    });

    it('applies default classes to link', () => {
        const element = createItem();
        const link = element.shadowRoot.querySelector('a');
        expect(link.className).toBe('slds-nav-vertical__action');
    });

    it('should show href argument in link', () => {
        const element = createItem();
        element.href = 'http://valid.href';

        return Promise.resolve(() => {
            const link = element.querySelector('a');
            expect(link.href).toBe('http://valid.href');
        });
    });
});

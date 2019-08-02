import { createElement } from 'lwc';
import Element from 'lightning/pill';

const createComponent = (props = {}) => {
    const element = createElement('lightning-pill', { is: Element });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
};

describe('lightning-pill', () => {
    it('should have a label when label prop is provided', () => {
        const element = createComponent({
            label: `Pill Label`,
        });

        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('should have href when href prop is provided', () => {
        const element = createComponent();
        element.label = `Pill Label`;
        element.href = `/path/to/some/where`;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('has error state', () => {
        const element = createComponent({
            label: `Pill Label`,
            hasError: true,
        });

        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
    it('is plain pill', () => {
        const element = createComponent();
        element.label = `Plain Pill Label`;
        element.variant = 'plain';
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('delete key should fire remove event', () => {
        const element = createComponent({
            label: `Plain Pill Label`,
            variant: 'plain',
        });

        let removed = false;
        element.addEventListener('remove', () => {
            removed = true;
        });

        const deleteKey = new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            keyCode: 46,
        });

        element.dispatchEvent(deleteKey);
        expect(removed).toBe(true);
    });

    it('backspace key should fire remove event', () => {
        const element = createComponent({
            label: `Plain Pill Label`,
            variant: 'plain',
        });
        let removed = false;

        element.addEventListener('remove', () => {
            removed = true;
        });

        const backspaceKey = new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            keyCode: 8,
        });

        element.dispatchEvent(backspaceKey);
        expect(removed).toBe(true);
    });

    it('isPlainLink return true if variant is plainLink', () => {
        const element = createComponent({
            label: 'Plain Pill Label',
            variant: 'plainLink',
        });
        expect(element.isPlainLink).toBe(true);
    });

    it("isPlainLink return false if variant isn't plainLink", () => {
        const element = createComponent({
            label: 'Plain Pill Label',
            variant: 'link',
        });
        expect(element.isPlainLink).toBe(false);
    });

    it('tabIndex/role/ariaSelected is set to anchor if variant is plainLink', () => {
        const element = createComponent({
            label: 'Plain Pill Label',
            variant: 'plainLink',
            tabIndex: 0,
            role: 'option',
            ariaSelected: true,
        });

        const a = element.shadowRoot.querySelector('a');
        expect(a.getAttribute('aria-selected')).toBe('true');
        expect(a.getAttribute('role')).toBe('option');
        expect(a.getAttribute('tabindex')).toBe('0');

        expect(element.getAttribute('aria-selected')).toBe(null);
        expect(element.getAttribute('role')).toBe(null);
        expect(element.getAttribute('tabindex')).toBe(null);
    });

    it("tabIndex/role/ariaSelected is set to self if variant isn't plainLink", () => {
        const element = createComponent({
            label: 'Plain Pill Label',
            variant: 'plain',
            tabIndex: 0,
            role: 'option',
            ariaSelected: true,
        });
        expect(element.isPlainLink).toBe(false);
        expect(element.getAttribute('aria-selected')).toBe('true');
        expect(element.getAttribute('role')).toBe('option');
        expect(element.getAttribute('tabindex')).toBe('0');
    });
});

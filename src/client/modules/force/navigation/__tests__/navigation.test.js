/**
 * Modified from webruntime_navigation/lightningNavigation tests
 */
import { api, createElement, LightningElement } from 'lwc';
import { CurrentPageReference, NavigationMixin } from '../navigation';

jest.mock('wire-service', () => ({
    register: jest.fn((symbol, wireCallback) => {
        wireCallback({
            addEventListener(eventName, callback) {
                callback();
            },
            dispatchEvent: jest.fn()
        });
    }),
    ValueChangedEvent: jest.fn()
}));

const mockPageRef = { type: 'test-type' };
function createComponentWithNavigation() {
    class ComponentWithNavigation extends NavigationMixin(LightningElement) {
        @api
        compute() {
            this[NavigationMixin.Navigate](mockPageRef, true);
            return this[NavigationMixin.GenerateUrl](mockPageRef).then(url => {
                return url;
            });
        }
    }
    const element = createElement('component-with-navigation', {
        is: ComponentWithNavigation
    });
    document.body.appendChild(element);
    return element;
}

describe('navigation', () => {
    describe('CurrentPageReference', () => {
        it('should throw error on imperative usage', () => {
            expect(() => {
                CurrentPageReference();
            }).toThrowErrorMatchingSnapshot();
        });
    });
    describe('NavigationMixin', () => {
        it('should throw error if not lightning element', () => {
            const NonLightningElementClass = Date;
            expect(() => {
                NavigationMixin(NonLightningElementClass);
            }).toThrowErrorMatchingSnapshot();
        });

        it('should return enhanced class', () => {
            class TestComponent extends NavigationMixin(LightningElement) {}
            expect(
                typeof TestComponent.prototype[NavigationMixin.Navigate]
            ).toBe('function');
            expect(
                typeof TestComponent.prototype[NavigationMixin.GenerateUrl]
            ).toBe('function');
        });

        it('handles Navigate and GenerateUrl', () => {
            const component = createComponentWithNavigation();
            expect(() => {
                component.compute();
            }).not.toThrow();
        });
    });
});

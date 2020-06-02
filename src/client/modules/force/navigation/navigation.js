/**
 * Provide an empty stub for force/navigation for components that use lightning/navigation.
 * Modified from webruntime_navigation/lightningNavigation
 */
import { register } from 'wire-service';

export const CurrentPageReference = Symbol('CurrentPageReference');
register(CurrentPageReference, target => {});

const Navigate = Symbol('Navigate');
const GenerateUrl = Symbol('GenerateUrl');

export const NavigationMixin = Base => {
    if (typeof Base.prototype.dispatchEvent !== 'function') {
        throw new TypeError(`${Base} must be an Element type`);
    }
    return class extends Base {
        [Navigate](pageReference, replace) {}
        [GenerateUrl](pageReference) {
            return Promise.resolve('');
        }
    };
};
NavigationMixin.Navigate = Navigate;
NavigationMixin.GenerateUrl = GenerateUrl;

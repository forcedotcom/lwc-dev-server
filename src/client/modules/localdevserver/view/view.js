import { LightningElement, track, wire } from 'lwc';
import { NavigationContext, subscribe } from 'webruntime_navigation/navigation';

/**
 * Copied from the LWR custom application. This should be removed once
 * this RFC is implemented: https://rfcs.lwc.dev/rfcs/lws/0000-router-views
 */
export default class LocalDevServerView extends LightningElement {
    @track message;
    @track customCtor = undefined;

    // Get a reference to the navigation context for this component.
    @wire(NavigationContext)
    navContext;

    connectedCallback() {
        // Subscribe to updates on the current state.
        this.subscription = subscribe(this.navContext, (_, routeDef) =>
            this.renderComponent(routeDef || {})
        );
    }

    async renderComponent({ component: specifier } = {}) {
        // Show an error if the component was not resolved.
        if (!specifier) {
            this.message = '404';
            return;
        }

        try {
            // Import the module from the given specifier, render the default export.
            const module = await import(specifier);
            if (!module.default || typeof module.default !== 'function') {
                throw new Error(
                    'Expected a route component with a default export'
                );
            }
            this.customCtor = module.default;
        } catch (e) {
            console.error(
                `Problem loading component "${specifier}": ${e.message || e}`
            );
            this.message = `An unexpected error occurred.`;
        }
    }

    disconnectedCallback() {
        // Unsubscribe from route changes.
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

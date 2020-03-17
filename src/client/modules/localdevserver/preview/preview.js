import { LightningElement, api, track, wire } from 'lwc';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';
import { NavigationContext, subscribe } from 'webruntime_navigation/navigation';

export default class Preview extends LightningElement {
    @wire(NavigationContext)
    navContext;

    @track error;
    @track metadata;
    @track dynamicCtor;
    @track isLoading = true;

    subscription;

    connectedCallback() {
        this.subscription = subscribe(this.navContext, route => {
            const { descriptor } = route.attributes;
            if (descriptor) {
                const jsName = descriptor.replace('-', '/'); // TODO
                this.loadHostedComponent(jsName);
            } else {
                console.error(
                    'There was a problem loading the component preview. The component descriptor was not found in the route:',
                    route
                );
            }
        });
    }

    async loadHostedComponent(jsName) {
        this.metadata = await getComponentMetadata(jsName);

        try {
            const module = await import(jsName);
            if (!module.default || typeof module.default !== 'function') {
                throw new Error(
                    `"${jsName}" is not a valid LWC module or it could not be found.`
                );
            }
            this.dynamicCtor = module.default;
            this.isLoading = false;
        } catch (error) {
            console.error(
                `There was a problem loading the component preview for "${jsName}".`,
                error
            );
            this.error = error;
            this.isLoading = false;
        }
    }

    get componentLabel() {
        return this.metadata ? this.metadata.htmlName : undefined;
    }

    get href() {
        // TODO generate url client side
        return this.metadata ? this.metadata.url : 'javascript:void(0);';
    }

    get vscodeHref() {
        return this.metadata && this.metadata.path
            ? `vscode://file/${this.metadata.path}`
            : 'javascript:void(0);';
    }

    disconnectedCallback() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

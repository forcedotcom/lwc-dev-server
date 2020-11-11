import { LightningElement, wire } from 'lwc';
import { NavigationContext, subscribe } from 'webruntime_navigation/navigation';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';
import { getPreviewUrl } from 'localdevserver/routerLib';

export default class Preview extends LightningElement {
    @wire(NavigationContext)
    navContext;

    isLoading = true;
    dynamicCtor;
    subscription;
    error;

    _href;
    _vscodeHref;
    _componentLabel;

    connectedCallback() {
        this.subscription = subscribe(this.navContext, route => {
            if (!route.attributes) {
                const error = new Error(
                    'The component to preview was not specified - The attributes property was not found in the url route.'
                );
                this.showError(error);
                this.isLoading = false;
                return;
            }

            const { namespace, name } = route.attributes;

            if (!namespace || !name) {
                const error = new Error(
                    'The component to preview was not specified - The component name and namespace were not found in the url route.'
                );
                this.showError(error);
                this.isLoading = false;
                return;
            }

            const specifier = `${namespace}/${name}`;
            this.loadHostedComponent(specifier)
                .catch(error => {
                    this.showError(error, specifier);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        });
    }

    disconnectedCallback() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async loadHostedComponent(specifier) {
        // load custom component metadata
        let metadata;
        try {
            metadata = await getComponentMetadata(specifier);
        } catch (e) {
            // we only want allow previews for components found in the project metadata
            const error = new Error(
                `The component named '${specifier}' was not found. Only components within the project namespace can be previewed.`
            );
            error.cause = e;
            throw error;
        }
        this._componentLabel = metadata.htmlName;
        this._vscodeHref = `vscode://file/${metadata.path}`;
        this._href = await getPreviewUrl(
            this.navContext,
            metadata.namespace,
            metadata.name
        );

        // dynamically load the component
        try {
            const module = await import(specifier);
            if (!module.default) {
                // This means there were some compilation errors
                // We throw a generic error and let the catch handle the messaging
                throw new Error();
            }
            this.dynamicCtor = module.default;
        } catch (error) {
            // We consume the error (which usally contains no useful information)
            // but reconstruct a new error with the compilation errors
            let err = new Error(
                `There were errors while compiling component ${specifier}`
            );
            err.specifier = specifier;
            throw err;
        }
    }

    showError(error, specifier = 'unknown') {
        this.error = error;
        console.group(
            `There was a problem loading the component preview for '${specifier}'`
        );
        console.error(error);
        if (error.cause) {
            console.error(error.cause);
        }
        console.groupEnd();
    }

    get componentLabel() {
        return this._componentLabel || 'unknown';
    }

    get href() {
        return this._href || 'javascript:void(0);';
    }

    get vscodeHref() {
        return this._vscodeHref || 'javascript:void(0);';
    }
}

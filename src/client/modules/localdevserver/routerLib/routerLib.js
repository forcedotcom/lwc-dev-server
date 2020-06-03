import { generateUrl } from 'webruntime_navigation/navigation';

export { default as routes } from './routes';

/**
 * Gets the url to the home page.
 * @param {NavigationContext} navContext - The webruntime NavigationContext.
 */
export async function getHomeUrl(navContext) {
    const route = {
        id: 'home'
    };
    return await generateUrl(navContext, route);
}

/**
 * Gets the url to preview a component.
 *
 * @param {NavigationContext} navContext - The webruntime NavigationContext.
 * @param {string} namespace - The component namespace.
 * @param {string} name - The component name.
 */
export async function getPreviewUrl(navContext, namespace, name) {
    const route = {
        id: 'preview',
        attributes: {
            namespace,
            name
        }
    };
    return await generateUrl(navContext, route);
}

/**
 * Gets the old url format (/lwc/preview/c) to preview a component.
 * We will retire this once majority of customers have upgraded their
 * VSCode Extension to new url format (/preview/c).
 *
 * @param {NavigationContext} navContext - The webruntime NavigationContext.
 * @param {string} namespace - The component namespace.
 * @param {string} name - The component name.
 */
export async function getOldPreviewUrl(navContext, namespace, name) {
    const route = {
        id: 'old-preview',
        attributes: {
            namespace,
            name
        }
    };
    return await generateUrl(navContext, route);
}

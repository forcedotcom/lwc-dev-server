/**
 *
 *
 */

const APEX_REGEX = /^(@salesforce\/apex)(?:\/([A-Za-z0-9]+\.[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)?))?$/;

function matchesApexScopedModule(id: string) {
    return id && id.match(APEX_REGEX);
}

/**
 * Rollup plugin that produce exports of the name of the requested
 * apex method from a standard or custom controller:
 * 1. @salesforce/apex for refreshApex and getSObjectValue functions
 * 2. @salesforce/apex/[apexClass].[apexMethod] for custom, non-namespaced apex or
 * 3. @salesforce/apex/[namespace].[apexClass].[apexMethod] for
 * namespaced apex.
 *
 * examples:
 * * import getCommunityName from '@salesforce/apex/applauncher.CommunityLogoController.getCommunityName';
 * * import getContactList from '@salesforce/apex/MyContactController.getContactList';
 * * import { refreshApex } from '@salesforce/apex';
 */
export default () => {
    return {
        name: 'rollup-plugin-apex',
        resolveId(id: string) {
            return matchesApexScopedModule(id) ? id : null;
        },
        load(id: string) {
            const idParts = matchesApexScopedModule(id);
            if (idParts) {
                // the first element is the whole id
                const [scope, apexDefinition] = idParts.slice(1, 3);

                if (apexDefinition) {
                    // handle @salesforce/apex/(ns.)class.method
                    // reverse because we don't require the namespace, but if
                    // its included, it will come first
                    const [method, classname, namespace = '""'] = apexDefinition
                        .split('.')
                        .reverse()
                        .map(content => JSON.stringify(content));

                    return `
                    import { getApexInvoker, generateGetApexWireAdapter } from 'force/lds';
                    import { register } from 'wire-service';

                    const apexInvoker = getApexInvoker(${namespace}, ${classname}, ${method}, false);
                    register(apexInvoker, generateGetApexWireAdapter(${namespace}, ${classname}, ${method}, false));
                    export default apexInvoker;
                    `;
                } else if (scope) {
                    // otherwise, handle @salesforce/apex
                    // refreshApex and getSObjectValue special case
                    return `
                    export { refresh as refreshApex, getSObjectValue } from 'force/lds';
                    `;
                }
            }
            return null;
        }
    };
};

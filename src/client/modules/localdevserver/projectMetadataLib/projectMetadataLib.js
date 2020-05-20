/**
 * Gets the session nonce for the page.
 */
export function getNonce() {
    const meta = document.head.querySelector(
        'meta[name=sessionNonce][content]'
    );

    return meta ? meta.content : '';
}

/**
 * Gets all of the project and component metadata.
 */
export async function getProjectMetadata() {
    if (window.LocalDev) {
        return window.LocalDev.project;
    }
    throw new Error('project metadata not set on the window');
}

/**
 * Gets the metadata for a single component.
 *
 * @param {string} specifier - The specifier, e.g., 'c/myButton'.
 * @param {string} [packageKey] - The sfdx package name containing this
 * specifier. If not specified then will look in the package marked as default.
 *
 * @throws Throws an error if the component is not found.
 */
export async function getComponentMetadata(specifier, packageKey) {
    const metadata = await getProjectMetadata();

    let pkg;
    if (packageKey) {
        pkg = metadata.packages.find(p => p.key === packageKey);
    } else {
        pkg = metadata.packages.find(p => !!p.isDefault);
    }

    if (pkg) {
        const component = pkg.components.find(cmp => cmp.jsName === specifier);
        if (component) {
            return component;
        } else {
            throw new Error(
                `Unable to find component '${specifier}' in the project metadata`
            );
        }
    } else {
        const packageName = packageKey
            ? `package '${packageKey}'`
            : "a package marked 'default'";
        throw new Error(
            `Unable to find ${packageName} in the project metadata`
        );
    }
}

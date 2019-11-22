async function loadMetadata() {
    if (window.LocalDev) {
        return Promise.resolve(window.LocalDev.project);
    } else {
        return Promise.reject(new Error('project metadata not set'));
    }
}

export function getNonce() {
    const meta = document.head.querySelector('meta[name=nonce][content]');

    return meta ? meta.content : '';
}

export async function getProjectMetadata() {
    return loadMetadata();
}

export async function getComponentMetadata(jsName, packageKey) {
    return new Promise(async (resolve, reject) => {
        const metadata = await loadMetadata();
        let pkg;
        if (packageKey) {
            pkg = metadata.packages.find(p => p.key === packageKey);
        } else {
            pkg = metadata.packages.find(p => !!p.isDefault);
        }

        if (pkg) {
            const component = pkg.components.find(cmp => cmp.jsName === jsName);
            if (component) {
                resolve(component);
                return;
            } else {
                reject(new Error(`Unable to find component '${jsName}'`));
            }
            resolve(pkg);
        } else {
            reject(
                new Error(`Unable to find package ${packageName || 'default'}`)
            );
        }
    });
}

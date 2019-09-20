async function loadMetadata() {
    if (window.LocalDev) {
        return Promise.resolve(window.LocalDev.project);
    } else {
        return Promise.reject(new Error('project metadata not set'));
    }
}

export async function getProjectMetadata() {
    return loadMetadata();
}

export async function getComponentMetadata(jsName, packageName) {
    return new Promise(async (resolve, reject) => {
        const metadata = await loadMetadata();
        let pkg;
        if (packageName) {
            pkg = metadata.packages.find(p => p.packageName === packageName);
        }
        if (!pkg) {
            pkg = metadata.packages.find(p => !!p.isDefault);
        }
        if (pkg) {
            const component = pkg.components.find(cmp => cmp.jsName === jsName);
            if (component) {
                resolve(component);
                return;
            } else {
                reject(`Unable to find component '${jsName}'`);
            }
            resolve(pkg);
        } else {
            reject(`Unable to find package ${packageName || 'default'}`);
        }
    });
}

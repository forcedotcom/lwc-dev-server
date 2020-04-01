import decamelize from 'decamelize';

/**
 * Helper function to wait until the microtask queue is empty.
 *
 * This is used by tests to wait until LWC has finished rerendering a component.
 */
export function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

/**
 * Creates mock metadata for a custom component.
 *
 * @param {string} namespace The component namespace, e.g., `c`.
 * @param {string} jsName The component name camel-cased, e.g., `myButton`.
 */
export function mockComponentMetadata(namespace, jsName) {
    const decamelizedName = decamelize(jsName, '-');

    return {
        namespace,
        name,
        jsName: `${namespace}/${jsName}`,
        htmlName: `${namespace}-${decamelizedName}`,
        url: `preview/${namespace}/${jsName}`,
        path: `/Users/arya/dev/test/src/${jsName}/${jsName}.js`
    };
}

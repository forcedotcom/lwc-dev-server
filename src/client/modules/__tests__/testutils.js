// Helper function to wait until the microtask queue is empty.
// This is needed for promise timing.
export function flushPromises() {
    // eslint-disable-next-line no-undef
    return new Promise(resolve => setImmediate(resolve));
}

import {
    subscribe,
    unsubscribe,
    setDebugFlag,
    isEmpEnabled,
    onError,
} from './../empApi';

describe('Unit Tests for empApi', () => {
    it('should return proper subscription response for valid subscribe call', async () => {
        const response = await subscribe(
            '/test/event__e' /* channel */,
            -1 /* replayId */,
            () => {} /* onMessageCallback */
        );
        expect(response).toMatchObject({
            channel: '/test/event__e',
            id: '_1552522747975_2306',
            replayId: -1,
        });
    });

    it('should return a promise that resolves to true for valid unubscribe call', async () => {
        const subscription = {};
        subscription.id = '_1552522747975_2306';
        const response = await unsubscribe(
            subscription,
            () => {} /* onMessageCallback */
        );
        expect(response).toBe(true);
    });

    it('should return a promise that resolves to true for valid onError call', async () => {
        const response = await onError(() => {} /* callback */);
        expect(response).toBe(true);
    });

    it('should return a promise that resolves to true for valid isEmpEnabled call', async () => {
        const response = await isEmpEnabled();
        expect(response).toBe(true);
    });

    it('should return a promise that resolves to true for valid setDebugFlag call', async () => {
        const response = await setDebugFlag({ flag: true });
        expect(response).toBe(true);
    });
});

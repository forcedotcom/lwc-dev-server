import { tokens, getToken } from '../lightningConfigProvider';

describe('lightningConfigProvider', () => {
    describe('getToken', () => {
        Object.entries(tokens).forEach(([key, value]) => {
            it(`returns the expected path for ${key}`, () => {
                expect(getToken(key)).toBe(value);
            });
        });
    });
});

import { MAX_RETRIES } from '../apexConstants';

describe('apexConstants', () => {
    it('MAX_RETRIES is 30', () => {
        expect(MAX_RETRIES).toBe(30);
    });
});

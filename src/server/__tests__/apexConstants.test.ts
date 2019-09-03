import { MAX_RETRIES } from '../apexConstants';

describe('apexConstants', () => {
    it('MAX_RETRIES is a positive number', () => {
        expect(MAX_RETRIES).toBeGreaterThan(0);
    });
});

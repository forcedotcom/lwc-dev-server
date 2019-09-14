import { WAIT_FOR_ONE_APP_LOAD } from '../apexConstants';

describe('apexConstants', () => {
    it('WAIT_FOR_ONE_APP_LOAD is a positive number', () => {
        expect(WAIT_FOR_ONE_APP_LOAD).toBeGreaterThan(0);
    });
});

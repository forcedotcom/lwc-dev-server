import { scaleToDecimalPlaces } from '../numberUtils';

describe('scaleToDecimalPlaces', () => {
    it('should return 1 when scale is 0', () => {
        const result = scaleToDecimalPlaces(0);

        expect(result).toBe(1);
    });
    it('should return 0.1 when scale is 1', () => {
        const result = scaleToDecimalPlaces(1);

        expect(result).toBe(0.1);
    });
    it('should return 0.00001 when scale is 5', () => {
        const result = scaleToDecimalPlaces(5);

        expect(result).toBe(0.00001);
    });
    it('should return 0.000000000001 when scale is 12', () => {
        const result = scaleToDecimalPlaces(12);

        expect(result).toBe(0.000000000001);
    });
    it('should return 1e-30 when scale is 30', () => {
        const result = scaleToDecimalPlaces(30);

        expect(result).toBe(1e-30);
    });
});

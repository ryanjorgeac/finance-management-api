import { centsToBigInt } from './bigint-transform';

describe('bigint-transform', () => {
  describe('centsToBigInt', () => {
    it('converts integer cents to bigint exactly', () => {
      expect(centsToBigInt(45025)).toBe(45025n);
      expect(centsToBigInt(0)).toBe(0n);
    });

    it('rejects non-integer cents values', () => {
      expect(() => centsToBigInt(450.25)).toThrow();
    });
  });
});

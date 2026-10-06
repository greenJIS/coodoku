import { describe, expect, it } from 'vitest';

import { ALL_DIGITS, bit, digitsOf, hasDigit, popcount } from './bits';

describe('bits', () => {
  it('ALL_DIGITS has exactly the bits for digits 1-9', () => {
    expect(popcount(ALL_DIGITS)).toBe(9);
    expect(hasDigit(ALL_DIGITS, 0)).toBe(false);
    expect(hasDigit(ALL_DIGITS, 9)).toBe(true);
  });

  it('bit and hasDigit agree', () => {
    expect(hasDigit(bit(4), 4)).toBe(true);
    expect(hasDigit(bit(4), 5)).toBe(false);
  });

  it('popcount counts set bits', () => {
    expect(popcount(0)).toBe(0);
    expect(popcount(0b1011)).toBe(3);
  });

  it('digitsOf lists digits in ascending order', () => {
    expect(digitsOf(bit(7) | bit(2) | bit(9))).toEqual([2, 7, 9]);
    expect(digitsOf(0)).toEqual([]);
  });
});

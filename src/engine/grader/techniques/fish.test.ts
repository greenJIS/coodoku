import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { swordfish, xWing } from './fish';

describe('xWing', () => {
  it('removes the digit from the two columns outside the two rows', () => {
    // Digit 5 sits in rows 1 and 4, only in columns 2 and 6. Cells 20 (r2c2)
    // and 69 (r7c6) share those columns and also hold a 5.
    const step = xWing(
      makeState({
        11: [5, 6],
        15: [5, 6],
        38: [5, 6],
        42: [5, 6],
        20: [5, 7],
        69: [5, 8],
      }),
    );
    expect(step).toEqual({
      technique: 'xWing',
      placements: [],
      eliminations: [
        { cell: 20, digit: 5 },
        { cell: 69, digit: 5 },
      ],
    });
  });

  it('removes the digit from the two rows outside the two columns', () => {
    // Digit 5 sits in columns 1 and 4, only in rows 2 and 6.
    // r2c1 (19), r2c4 (22), r6c1 (55), r6c4 (58).
    // Cells 26 (r2c8) and 62 (r6c8) share those rows and also hold a 5.
    const step = xWing(
      makeState({
        19: [5, 6],
        22: [5, 6],
        55: [5, 6],
        58: [5, 6],
        26: [5, 7],
        62: [5, 8],
      }),
    );
    expect(step).toEqual({
      technique: 'xWing',
      placements: [],
      eliminations: [
        { cell: 26, digit: 5 },
        { cell: 62, digit: 5 },
      ],
    });
  });

  it('finds nothing when no other cell shares the columns', () => {
    const state = makeState({ 11: [5, 6], 15: [5, 6], 38: [5, 6], 42: [5, 6] });
    expect(xWing(state)).toBeNull();
  });
});

describe('swordfish', () => {
  it('removes the digit from the three columns outside the three rows', () => {
    // Digit 4 in rows 0, 3, 6, only in columns 1, 4, 7. Cells 19, 49, 79 are
    // in those columns (rows 2, 5, 8) and also hold a 4.
    const step = swordfish(
      makeState({
        1: [4, 5],
        4: [4, 5],
        31: [4, 5],
        34: [4, 5],
        55: [4, 5],
        61: [4, 5],
        19: [4, 9],
        49: [4, 9],
        79: [4, 9],
      }),
    );
    expect(step).toEqual({
      technique: 'swordfish',
      placements: [],
      eliminations: [
        { cell: 19, digit: 4 },
        { cell: 49, digit: 4 },
        { cell: 79, digit: 4 },
      ],
    });
  });

  it('finds nothing when no other cell shares the columns', () => {
    const state = makeState({
      1: [4, 5],
      4: [4, 5],
      31: [4, 5],
      34: [4, 5],
      55: [4, 5],
      61: [4, 5],
    });
    expect(swordfish(state)).toBeNull();
  });
});

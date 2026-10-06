import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { hiddenPair, hiddenTriple } from './hiddenSubset';

describe('hiddenPair', () => {
  it('strips other candidates from the two cells that own the pair', () => {
    // Row 0: digits 1 and 2 fit only in cells 0 and 1.
    const step = hiddenPair(makeState({ 0: [1, 2, 3], 1: [1, 2, 4] }));
    expect(step).toEqual({
      technique: 'hiddenPair',
      placements: [],
      eliminations: [
        { cell: 0, digit: 3 },
        { cell: 1, digit: 4 },
      ],
    });
  });

  it('finds nothing when the pair cells hold no other candidates', () => {
    const state = makeState({ 0: [1, 2], 1: [1, 2], 9: [1, 2], 10: [1, 2] });
    expect(hiddenPair(state)).toBeNull();
  });
});

describe('hiddenTriple', () => {
  it('strips other candidates from the three cells that own the triple', () => {
    // Row 0: digits 1, 2, 3 fit only in cells 0, 1, 2.
    const step = hiddenTriple(
      makeState({ 0: [1, 2, 9], 1: [2, 3, 8], 2: [1, 3, 7] }),
    );
    expect(step).toEqual({
      technique: 'hiddenTriple',
      placements: [],
      eliminations: [
        { cell: 0, digit: 9 },
        { cell: 1, digit: 8 },
        { cell: 2, digit: 7 },
      ],
    });
  });

  it('finds nothing when the triple cells hold no other candidates', () => {
    const state = makeState({ 0: [1, 2, 3], 1: [1, 2, 3], 2: [1, 2, 3] });
    expect(hiddenTriple(state)).toBeNull();
  });
});

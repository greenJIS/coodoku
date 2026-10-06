import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { nakedPair, nakedTriple } from './nakedSubset';

describe('nakedPair', () => {
  it('removes the pair digits from the rest of the unit', () => {
    const step = nakedPair(makeState({ 0: [3, 4], 1: [3, 4], 2: [3, 4, 7] }));
    expect(step).toEqual({
      technique: 'nakedPair',
      placements: [],
      eliminations: [
        { cell: 2, digit: 3 },
        { cell: 2, digit: 4 },
      ],
    });
  });

  it('finds nothing when the other cells do not hold the pair digits', () => {
    const state = makeState({ 0: [3, 4], 1: [3, 4], 2: [5, 6, 7] });
    expect(nakedPair(state)).toBeNull();
  });
});

describe('nakedTriple', () => {
  it('removes the triple digits from the rest of the unit', () => {
    // Cells 0-2 together hold only {1, 2, 3}; cell 3 loses its 1.
    const step = nakedTriple(
      makeState({ 0: [1, 2], 1: [2, 3], 2: [1, 3], 3: [1, 5, 9] }),
    );
    expect(step).toEqual({
      technique: 'nakedTriple',
      placements: [],
      eliminations: [{ cell: 3, digit: 1 }],
    });
  });

  it('finds nothing when three cells span more than three digits', () => {
    const state = makeState({ 0: [1, 2], 1: [2, 3], 2: [1, 4] });
    expect(nakedTriple(state)).toBeNull();
  });
});

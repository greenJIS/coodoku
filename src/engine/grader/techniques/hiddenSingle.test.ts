import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { hiddenSingle } from './hiddenSingle';

describe('hiddenSingle', () => {
  it('places a digit that fits only one cell of a unit', () => {
    // Row 0: digit 3 can only go in cell 1.
    const step = hiddenSingle(
      makeState({ 0: [1, 2], 1: [1, 2, 3], 2: [1, 2] }),
    );
    expect(step).toEqual({
      technique: 'hiddenSingle',
      placements: [{ cell: 1, digit: 3 }],
      eliminations: [],
    });
  });

  it('finds nothing when every digit fits two or more cells in each unit', () => {
    // A 2x2 block inside one box, all cells {1, 2}.
    const state = makeState({ 0: [1, 2], 1: [1, 2], 9: [1, 2], 10: [1, 2] });
    expect(hiddenSingle(state)).toBeNull();
  });
});

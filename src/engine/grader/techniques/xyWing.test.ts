import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { xyWing } from './xyWing';

describe('xyWing', () => {
  it('removes z from the cell that sees both pincers', () => {
    // Pivot r0c0 {1,2}. Pincer r0c4 {1,3} shares its row, pincer r4c0 {2,3}
    // shares its column. r4c4 (cell 40) sees both pincers and holds a 3.
    const step = xyWing(
      makeState({ 0: [1, 2], 4: [1, 3], 36: [2, 3], 40: [3, 7] }),
    );
    expect(step).toEqual({
      technique: 'xyWing',
      placements: [],
      eliminations: [{ cell: 40, digit: 3 }],
    });
  });

  it('finds nothing when no cell sees both pincers and holds z', () => {
    const state = makeState({ 0: [1, 2], 4: [1, 3], 36: [2, 3], 40: [7, 8] });
    expect(xyWing(state)).toBeNull();
  });

  it('finds nothing without a pivot and two pincers', () => {
    expect(xyWing(makeState({ 0: [1, 2], 4: [1, 3] }))).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { lockedCandidates } from './lockedCandidates';

describe('lockedCandidates', () => {
  it('pointing: a digit confined to one row of a box leaves the rest of that row', () => {
    // Box 0: digit 5 only in cells 0 and 1 (row 0). Cell 5 is row 0, box 1.
    const step = lockedCandidates(
      makeState({ 0: [5, 6], 1: [5, 7], 5: [5, 8] }),
    );
    expect(step).toEqual({
      technique: 'lockedCandidates',
      placements: [],
      eliminations: [{ cell: 5, digit: 5 }],
    });
  });

  it('claiming: a digit confined to one box of a row leaves the rest of that box', () => {
    // Row 0: digit 4 only in cells 0 and 1 (box 0). Cell 9 is box 0, row 1.
    const step = lockedCandidates(
      makeState({ 0: [4, 6], 1: [4, 7], 9: [4, 8] }),
    );
    expect(step).toEqual({
      technique: 'lockedCandidates',
      placements: [],
      eliminations: [{ cell: 9, digit: 4 }],
    });
  });

  it('pointing column: a digit confined to one col of a box leaves the rest of that col', () => {
    // Box 0: digit 3 only in cells 0 and 9 (col 0). Cell 27 is col 0, box 3.
    const step = lockedCandidates(
      makeState({ 0: [3, 6], 9: [3, 7], 27: [3, 8] }),
    );
    expect(step).toEqual({
      technique: 'lockedCandidates',
      placements: [],
      eliminations: [{ cell: 27, digit: 3 }],
    });
  });

  it('claiming column: a digit confined to one box of a col leaves the rest of that box', () => {
    // Col 0: digit 2 only in cells 0 and 9 (box 0).
    // Cell 5 is row 0 box 1 (so row 0 spans two boxes and doesn't claim).
    // Cell 1 is box 0, col 1.
    const step = lockedCandidates(
      makeState({ 0: [2, 6], 9: [2, 7], 5: [2, 9], 1: [2, 8] }),
    );
    expect(step).toEqual({
      technique: 'lockedCandidates',
      placements: [],
      eliminations: [{ cell: 1, digit: 2 }],
    });
  });

  it('finds nothing when no digit is confined', () => {
    // Four cells spread over four boxes, so no unit holds two of them.
    const state = makeState({ 0: [1, 2], 3: [1, 2], 27: [1, 2], 30: [1, 2] });
    expect(lockedCandidates(state)).toBeNull();
  });
});

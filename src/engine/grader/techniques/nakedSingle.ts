import { digitsOf, popcount } from '../../bits';
import type { Step } from '../../types';
import type { State } from '../candidates';

/** A cell with exactly one candidate left must hold that digit. */
export function nakedSingle(state: State): Step | null {
  for (let cell = 0; cell < 81; cell++) {
    if (state.cells[cell] !== 0 || popcount(state.cands[cell]) !== 1) continue;
    const [digit] = digitsOf(state.cands[cell]);
    return {
      technique: 'nakedSingle',
      placements: [{ cell, digit }],
      eliminations: [],
    };
  }
  return null;
}

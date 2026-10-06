import { hasDigit } from '../../bits';
import type { Step } from '../../types';
import { UNITS } from '../../units';
import type { State } from '../candidates';

/** A digit that fits in only one cell of a unit must go in that cell. */
export function hiddenSingle(state: State): Step | null {
  for (const unit of UNITS) {
    for (let digit = 1; digit <= 9; digit++) {
      let found = -1;
      let count = 0;
      for (const cell of unit) {
        if (state.cells[cell] === 0 && hasDigit(state.cands[cell], digit)) {
          found = cell;
          count++;
          if (count > 1) break;
        }
      }
      if (count === 1) {
        return {
          technique: 'hiddenSingle',
          placements: [{ cell: found, digit }],
          eliminations: [],
        };
      }
    }
  }
  return null;
}

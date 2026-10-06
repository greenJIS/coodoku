import { bit, digitsOf, hasDigit, popcount } from '../../bits';
import type { CellDigit, Step } from '../../types';
import { PEERS } from '../../units';
import type { State } from '../candidates';

/**
 * A pivot with candidates {x, y} sees a pincer {x, z} and a pincer {y, z}.
 * Whatever the pivot is, one pincer ends up as z, so z is removed from every
 * cell that sees both pincers.
 */
export function xyWing(state: State): Step | null {
  const bivalue = (cell: number): boolean =>
    state.cells[cell] === 0 && popcount(state.cands[cell]) === 2;

  for (let pivot = 0; pivot < 81; pivot++) {
    if (!bivalue(pivot)) continue;
    const [x, y] = digitsOf(state.cands[pivot]);
    const peers = PEERS[pivot].filter(bivalue);

    for (const a of peers) {
      const maskA = state.cands[a];
      if (!hasDigit(maskA, x) || hasDigit(maskA, y)) continue;
      const [z] = digitsOf(maskA & ~bit(x));
      const wanted = bit(y) | bit(z);

      for (const b of peers) {
        if (b === a || state.cands[b] !== wanted) continue;
        const eliminations: CellDigit[] = [];
        for (const cell of PEERS[a]) {
          if (cell === pivot || !PEERS[b].includes(cell)) continue;
          if (state.cells[cell] === 0 && hasDigit(state.cands[cell], z)) {
            eliminations.push({ cell, digit: z });
          }
        }
        if (eliminations.length > 0) {
          return { technique: 'xyWing', placements: [], eliminations };
        }
      }
    }
  }
  return null;
}

export const findXyWing = xyWing;

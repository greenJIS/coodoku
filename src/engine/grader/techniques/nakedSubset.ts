import { digitsOf, popcount } from '../../bits';
import type { CellDigit, Step, Technique } from '../../types';
import { UNITS } from '../../units';
import type { State } from '../candidates';
import { combinations } from '../combinations';

type TechniqueFn = (state: State) => Step | null;

/**
 * `size` cells in a unit whose candidates together hold only `size` digits.
 * Those digits belong to those cells, so they leave every other cell.
 */
function nakedSubset(size: number, technique: Technique): TechniqueFn {
  return (state: State): Step | null => {
    for (const unit of UNITS) {
      const empties = unit.filter((cell) => state.cells[cell] === 0);
      const pool = empties.filter((cell) => {
        const count = popcount(state.cands[cell]);
        return count >= 2 && count <= size;
      });
      for (const group of combinations(pool, size)) {
        const union = group.reduce((mask, cell) => mask | state.cands[cell], 0);
        if (popcount(union) !== size) continue;
        const eliminations: CellDigit[] = [];
        for (const cell of empties) {
          if (group.includes(cell)) continue;
          for (const digit of digitsOf(state.cands[cell] & union)) {
            eliminations.push({ cell, digit });
          }
        }
        if (eliminations.length > 0) {
          return { technique, placements: [], eliminations };
        }
      }
    }
    return null;
  };
}

export const nakedPair = nakedSubset(2, 'nakedPair');
export const nakedTriple = nakedSubset(3, 'nakedTriple');

import { bit, digitsOf, hasDigit } from '../../bits';
import type { CellDigit, Step, Technique } from '../../types';
import { UNITS } from '../../units';
import type { State } from '../candidates';
import { combinations } from '../combinations';

type TechniqueFn = (state: State) => Step | null;

/**
 * `size` digits that, within a unit, fit only in the same `size` cells.
 * Those cells must hold those digits, so every other candidate leaves them.
 */
function hiddenSubset(size: number, technique: Technique): TechniqueFn {
  return (state: State): Step | null => {
    for (const unit of UNITS) {
      const empties = unit.filter((cell) => state.cells[cell] === 0);
      const cellsOf = new Map<number, number[]>();
      for (let digit = 1; digit <= 9; digit++) {
        const where = empties.filter((cell) =>
          hasDigit(state.cands[cell], digit),
        );
        if (where.length >= 2 && where.length <= size) {
          cellsOf.set(digit, where);
        }
      }
      for (const digits of combinations([...cellsOf.keys()], size)) {
        const union = new Set<number>();
        for (const digit of digits) {
          for (const cell of cellsOf.get(digit) ?? []) union.add(cell);
        }
        if (union.size !== size) continue;
        const keep = digits.reduce((mask, digit) => mask | bit(digit), 0);
        const eliminations: CellDigit[] = [];
        for (const cell of [...union].sort((a, b) => a - b)) {
          for (const digit of digitsOf(state.cands[cell] & ~keep)) {
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

export const hiddenPair = hiddenSubset(2, 'hiddenPair');
export const hiddenTriple = hiddenSubset(3, 'hiddenTriple');

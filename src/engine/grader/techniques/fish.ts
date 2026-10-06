import { hasDigit } from '../../bits';
import type { CellDigit, Step, Technique } from '../../types';
import { COL_OF, COLS, ROW_OF, ROWS } from '../../units';
import type { State } from '../candidates';
import { combinations } from '../combinations';

type TechniqueFn = (state: State) => Step | null;

interface Option {
  line: number;
  covers: number[];
}

/**
 * Fish of a given size. In `size` rows, a digit is confined to the same
 * `size` columns, so it can be removed from those columns everywhere else.
 * The same logic runs with rows and columns swapped.
 */
function fish(size: number, technique: Technique): TechniqueFn {
  return (state: State): Step | null => {
    for (let digit = 1; digit <= 9; digit++) {
      for (const byRows of [true, false]) {
        const baseLines = byRows ? ROWS : COLS;
        const coverOf = byRows ? COL_OF : ROW_OF;
        const baseOf = byRows ? ROW_OF : COL_OF;
        const coverLines = byRows ? COLS : ROWS;

        const options: Option[] = [];
        baseLines.forEach((cells, line) => {
          const covers = cells
            .filter(
              (cell) =>
                state.cells[cell] === 0 && hasDigit(state.cands[cell], digit),
            )
            .map((cell) => coverOf[cell]);
          if (covers.length >= 2 && covers.length <= size) {
            options.push({ line, covers });
          }
        });

        for (const group of combinations(options, size)) {
          const covers = new Set(group.flatMap((option) => option.covers));
          if (covers.size !== size) continue;
          const bases = new Set(group.map((option) => option.line));
          const eliminations: CellDigit[] = [];
          for (const cover of [...covers].sort((a, b) => a - b)) {
            for (const cell of coverLines[cover]) {
              if (bases.has(baseOf[cell])) continue;
              if (
                state.cells[cell] === 0 &&
                hasDigit(state.cands[cell], digit)
              ) {
                eliminations.push({ cell, digit });
              }
            }
          }
          if (eliminations.length > 0) {
            return { technique, placements: [], eliminations };
          }
        }
      }
    }
    return null;
  };
}

export const xWing = fish(2, 'xWing');
export const swordfish = fish(3, 'swordfish');

export const findXWing = xWing;
export const findSwordfish = swordfish;

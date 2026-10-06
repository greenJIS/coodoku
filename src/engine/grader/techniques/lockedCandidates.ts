import { hasDigit } from '../../bits';
import type { CellDigit, Step } from '../../types';
import { BOX_OF, BOXES, COL_OF, COLS, ROW_OF, ROWS } from '../../units';
import type { State } from '../candidates';

const candidateAt = (state: State, cell: number, digit: number): boolean =>
  state.cells[cell] === 0 && hasDigit(state.cands[cell], digit);

const toStep = (cells: number[], digit: number): Step | null => {
  if (cells.length === 0) return null;
  const eliminations: CellDigit[] = cells.map((cell) => ({ cell, digit }));
  return { technique: 'lockedCandidates', placements: [], eliminations };
};

/**
 * Pointing: inside a box a digit is confined to one row (or column), so it
 * can be removed from the rest of that row (or column).
 * Claiming: inside a row (or column) a digit is confined to one box, so it
 * can be removed from the rest of that box.
 */
export function lockedCandidates(state: State): Step | null {
  for (let box = 0; box < 9; box++) {
    for (let digit = 1; digit <= 9; digit++) {
      const where = BOXES[box].filter((cell) =>
        candidateAt(state, cell, digit),
      );
      if (where.length < 2) continue;

      if (where.every((cell) => ROW_OF[cell] === ROW_OF[where[0]])) {
        const others = ROWS[ROW_OF[where[0]]].filter(
          (cell) => BOX_OF[cell] !== box && candidateAt(state, cell, digit),
        );
        const step = toStep(others, digit);
        if (step) return step;
      }
      if (where.every((cell) => COL_OF[cell] === COL_OF[where[0]])) {
        const others = COLS[COL_OF[where[0]]].filter(
          (cell) => BOX_OF[cell] !== box && candidateAt(state, cell, digit),
        );
        const step = toStep(others, digit);
        if (step) return step;
      }
    }
  }

  for (const line of [...ROWS, ...COLS]) {
    for (let digit = 1; digit <= 9; digit++) {
      const where = line.filter((cell) => candidateAt(state, cell, digit));
      if (where.length < 2) continue;
      const box = BOX_OF[where[0]];
      if (!where.every((cell) => BOX_OF[cell] === box)) continue;
      const others = BOXES[box].filter(
        (cell) => !line.includes(cell) && candidateAt(state, cell, digit),
      );
      const step = toStep(others, digit);
      if (step) return step;
    }
  }
  return null;
}

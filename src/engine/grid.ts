import type { Grid } from './types';
import { UNITS } from './units';

export const CELLS = 81;

/** Throws RangeError unless `grid` has 81 cells that are all 0-9. */
export function assertGrid(grid: Grid): void {
  if (grid.length !== CELLS) {
    throw new RangeError(`Grid must have ${CELLS} cells, got ${grid.length}`);
  }
  for (let cell = 0; cell < CELLS; cell++) {
    if (grid[cell] > 9) {
      throw new RangeError(`Cell ${cell} has invalid digit ${grid[cell]}`);
    }
  }
}

export function clueCount(grid: Grid): number {
  let count = 0;
  for (let cell = 0; cell < grid.length; cell++) {
    if (grid[cell] !== 0) count++;
  }
  return count;
}

/** True when every row, column, and box holds the digits 1-9 exactly once. */
export function isValidSolution(grid: Grid): boolean {
  if (grid.length !== CELLS) return false;
  return UNITS.every((unit) => {
    let seen = 0;
    for (const cell of unit) {
      const digit = grid[cell];
      if (digit < 1 || digit > 9) return false;
      seen |= 1 << digit;
    }
    return seen === 0x3fe;
  });
}

import { ALL_DIGITS, digitsOf, popcount } from './bits';
import { assertGrid } from './grid';
import type { Rng } from './rng';
import type { Grid } from './types';
import { BOX_OF, COL_OF, ROW_OF } from './units';

/**
 * Bitmask backtracking, always filling the cell with the fewest candidates.
 * Calls `onSolution` for each solution found (up to `limit`) and returns how
 * many were found. With an `rng`, digits are tried in random order.
 */
function search(
  grid: Grid,
  limit: number,
  rng: Rng | undefined,
  onSolution: (cells: Uint8Array) => void,
): number {
  const cells = Uint8Array.from(grid);
  const rows = new Uint16Array(9);
  const cols = new Uint16Array(9);
  const boxes = new Uint16Array(9);

  for (let cell = 0; cell < 81; cell++) {
    const digit = cells[cell];
    if (digit === 0) continue;
    const mask = 1 << digit;
    const r = ROW_OF[cell];
    const c = COL_OF[cell];
    const b = BOX_OF[cell];
    if ((rows[r] | cols[c] | boxes[b]) & mask) return 0;
    rows[r] |= mask;
    cols[c] |= mask;
    boxes[b] |= mask;
  }

  let found = 0;

  const visit = (): void => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let cell = 0; cell < 81; cell++) {
      if (cells[cell] !== 0) continue;
      const mask =
        ALL_DIGITS &
        ~(rows[ROW_OF[cell]] | cols[COL_OF[cell]] | boxes[BOX_OF[cell]]);
      const count = popcount(mask);
      if (count === 0) return;
      if (count < bestCount) {
        best = cell;
        bestMask = mask;
        bestCount = count;
        if (count === 1) break;
      }
    }

    if (best === -1) {
      found++;
      onSolution(cells);
      return;
    }

    const digits = digitsOf(bestMask);
    if (rng) rng.shuffle(digits);
    const r = ROW_OF[best];
    const c = COL_OF[best];
    const b = BOX_OF[best];
    for (const digit of digits) {
      const mask = 1 << digit;
      cells[best] = digit;
      rows[r] |= mask;
      cols[c] |= mask;
      boxes[b] |= mask;
      visit();
      cells[best] = 0;
      rows[r] &= ~mask;
      cols[c] &= ~mask;
      boxes[b] &= ~mask;
      if (found >= limit) return;
    }
  };

  visit();
  return found;
}

/** Counts solutions, stopping at `limit`. Throws RangeError on a bad grid. */
export function countSolutions(grid: Grid, limit = 2): number {
  assertGrid(grid);
  return search(grid, limit, undefined, () => undefined);
}

/** First solution found, or null. Pass an `rng` for a random one. */
export function solve(grid: Grid, rng?: Rng): Grid | null {
  assertGrid(grid);
  const solutions: Grid[] = [];
  search(grid, 1, rng, (cells) => solutions.push(Uint8Array.from(cells)));
  return solutions.length > 0 ? solutions[0] : null;
}

import type { Puzzle } from '../engine';

export const VALID_SOLUTION: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5,
  6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5,
  6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5,
  6, 7, 8,
];

/** A solved grid with `emptyCells` blanked out (default: only cell 1). */
export function makePuzzle(emptyCells: number[] = [1]): Puzzle {
  const puzzle = new Uint8Array(81);
  for (let i = 0; i < 81; i++) {
    if (!emptyCells.includes(i)) puzzle[i] = VALID_SOLUTION[i];
  }
  return {
    puzzle,
    solution: Uint8Array.from(VALID_SOLUTION),
    difficulty: 'easy',
    exact: true,
    seed: 42,
    rating: { hardest: 'nakedSingle', counts: {} as never },
  };
}

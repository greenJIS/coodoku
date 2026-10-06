import { CLUE_RANGE, compareTier, tierOf } from './difficulty';
import { EngineError } from './errors';
import { gradePuzzle } from './grader/grade';
import type { Rng } from './rng';
import { countSolutions, solve } from './solver';
import type { Difficulty, Grid, Rating } from './types';

/** Start grading once the puzzle is this close to its clue goal. */
const GRADE_WINDOW = 8;

/** A graded puzzle that carving produced. */
export interface Candidate {
  puzzle: Grid;
  rating: Rating;
  tier: Difficulty;
}

export interface CarveOutcome {
  /** A puzzle whose tier equals the target, or null. */
  accepted: Candidate | null;
  /** The hardest puzzle seen whose tier does not exceed the target. */
  best: Candidate | null;
}

/** A random complete, valid grid. */
export function fullGrid(rng: Rng): Grid {
  const grid = solve(new Uint8Array(81), rng);
  if (grid === null) throw new EngineError('Could not build a full grid');
  return grid;
}

/**
 * Removes clues from a solved grid, always keeping exactly one solution.
 *
 * Far from the clue goal every puzzle is easy, so clues are removed at random
 * without grading. Within `GRADE_WINDOW` clues of the goal the puzzle is graded
 * after every removal and must stay at or below the target tier. Once at the
 * goal, every possible single removal is graded and the one that raises the
 * tier the most (without passing the target) is taken. That steers toward the
 * target tier instead of hoping a random removal lands on it.
 */
export function carve(
  solution: Grid,
  rng: Rng,
  target: Difficulty,
  shouldStop: () => boolean = () => false,
): CarveOutcome {
  const puzzle = Uint8Array.from(solution);
  const { min, max } = CLUE_RANGE[target];
  const goal = min + rng.int(max - min + 1);
  let clues = 81;
  let best: Candidate | null = null;

  const isUniqueWithout = (cell: number): boolean => {
    const digit = puzzle[cell];
    puzzle[cell] = 0;
    const unique = countSolutions(puzzle, 2) === 1;
    puzzle[cell] = digit;
    return unique;
  };

  /** Tier after removing `cell`, or null if that is not allowed. */
  const tierWithout = (cell: number): Difficulty | null => {
    const digit = puzzle[cell];
    puzzle[cell] = 0;
    let tier: Difficulty | null = null;
    if (countSolutions(puzzle, 2) === 1) {
      const rating = gradePuzzle(puzzle);
      if (rating !== null && compareTier(tierOf(rating), target) <= 0) {
        tier = tierOf(rating);
      }
    }
    puzzle[cell] = digit;
    return tier;
  };

  while (!shouldStop()) {
    const cells = rng.shuffle(
      Array.from({ length: 81 }, (_, cell) => cell).filter(
        (cell) => puzzle[cell] !== 0,
      ),
    );

    if (clues > goal + GRADE_WINDOW) {
      const cell = cells.find(isUniqueWithout);
      if (cell === undefined) break;
      puzzle[cell] = 0;
      clues--;
      continue;
    }

    const rating = gradePuzzle(puzzle);
    if (rating === null) break;
    const tier = tierOf(rating);
    if (compareTier(tier, target) > 0) break;
    const here: Candidate = { puzzle: Uint8Array.from(puzzle), rating, tier };
    if (best === null || compareTier(tier, best.tier) >= 0) best = here;
    if (tier === target && clues <= goal) return { accepted: here, best };

    let choice = -1;
    if (clues > goal) {
      choice = cells.find((cell) => tierWithout(cell) !== null) ?? -1;
    } else {
      let choiceTier: Difficulty | null = null;
      for (const cell of cells) {
        const next = tierWithout(cell);
        if (
          next !== null &&
          (choiceTier === null || compareTier(next, choiceTier) > 0)
        ) {
          choice = cell;
          choiceTier = next;
        }
      }
    }

    if (choice === -1) {
      // Nothing more can be removed. A puzzle at the target tier is still
      // good, even if it kept more clues than the goal.
      return tier === target
        ? { accepted: here, best }
        : { accepted: null, best };
    }
    puzzle[choice] = 0;
    clues--;
  }

  return { accepted: null, best };
}

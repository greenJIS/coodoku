import { compareTier, DEFAULT_BUDGET_MS } from './difficulty';
import { EngineError } from './errors';
import { carve, fullGrid } from './generator';
import type { Candidate } from './generator';
import { createRng, deriveSeed, randomSeed } from './rng';
import { DIFFICULTIES } from './types';
import type { Difficulty, Grid, Puzzle } from './types';

export interface GeneratePuzzleOptions {
  difficulty: Difficulty;
  /** Same seed and options give the same puzzle (within the time budget). */
  seed?: number;
  budgetMs?: number;
  /** Clock in milliseconds. Injectable so tests can control time. */
  now?: () => number;
}

/** Give up if no attempt produces any usable puzzle. Practically unreachable. */
const MAX_EMPTY_ATTEMPTS = 200;

interface Best {
  solution: Grid;
  candidate: Candidate;
}

function toPuzzle(
  seed: number,
  difficulty: Difficulty,
  best: Best,
  exact: boolean,
): Puzzle {
  return {
    puzzle: best.candidate.puzzle,
    solution: best.solution,
    difficulty,
    exact,
    rating: best.candidate.rating,
    seed,
  };
}

/**
 * Builds a puzzle with exactly one solution whose hardest required technique
 * matches `difficulty`. If the time budget runs out first, returns the
 * hardest puzzle found that is not harder than requested, with `exact: false`.
 */
export function generatePuzzle(options: GeneratePuzzleOptions): Puzzle {
  const { difficulty } = options;
  if (!DIFFICULTIES.includes(difficulty)) {
    throw new RangeError(`Unknown difficulty: ${String(difficulty)}`);
  }
  const seed = options.seed ?? randomSeed();
  const now = options.now ?? (() => performance.now());
  const deadline = now() + (options.budgetMs ?? DEFAULT_BUDGET_MS[difficulty]);

  let best: Best | null = null;

  for (let attempt = 0; ; attempt++) {
    const rng = createRng(deriveSeed(seed, attempt));
    const solution = fullGrid(rng);
    const outcome = carve(
      solution,
      rng,
      difficulty,
      () => best !== null && now() >= deadline,
    );

    if (outcome.accepted !== null) {
      return toPuzzle(
        seed,
        difficulty,
        { solution, candidate: outcome.accepted },
        true,
      );
    }
    if (
      outcome.best !== null &&
      (best === null || compareTier(outcome.best.tier, best.candidate.tier) > 0)
    ) {
      best = { solution, candidate: outcome.best };
    }
    if (best !== null && now() >= deadline) {
      // The clock can run out after a candidate already reached the target
      // tier but before carving hit the clue goal; that puzzle is still exact.
      return toPuzzle(
        seed,
        difficulty,
        best,
        best.candidate.tier === difficulty,
      );
    }
    if (best === null && attempt >= MAX_EMPTY_ATTEMPTS) {
      throw new EngineError('Could not generate a puzzle');
    }
  }
}

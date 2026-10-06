import { describe, expect, it } from 'vitest';

import { compareTier, tierOf } from './difficulty';
import { seedCount } from './fixtures';
import { generatePuzzle } from './generate';
import { gradePuzzle } from './grader/grade';
import { isValidSolution } from './grid';
import { countSolutions } from './solver';
import { DIFFICULTIES } from './types';
import type { Difficulty, Puzzle } from './types';

/** Seeds per difficulty for a full run. Hooks run a tenth of these. */
const FULL_COUNTS: Record<Difficulty, number> = {
  easy: 200,
  medium: 200,
  hard: 40,
  expert: 15,
};

function expectWellFormed(result: Puzzle, difficulty: Difficulty): void {
  expect(result.difficulty).toBe(difficulty);
  expect(isValidSolution(result.solution)).toBe(true);
  for (let cell = 0; cell < 81; cell++) {
    if (result.puzzle[cell] !== 0) {
      expect(result.puzzle[cell]).toBe(result.solution[cell]);
    }
  }
  expect(countSolutions(result.puzzle, 2)).toBe(1);

  const graded = gradePuzzle(result.puzzle);
  expect(graded).toEqual(result.rating);
  const tier = tierOf(result.rating);
  if (result.exact) expect(tier).toBe(difficulty);
  else expect(compareTier(tier, difficulty)).toBeLessThan(0);
}

describe.each(DIFFICULTIES)('generatePuzzle (%s)', (difficulty) => {
  it(
    'builds unique-solution puzzles of the requested tier',
    { timeout: 600_000 },
    () => {
      for (let seed = 1; seed <= seedCount(FULL_COUNTS[difficulty]); seed++) {
        const result = generatePuzzle({ difficulty, seed });
        expect(result.seed).toBe(seed);
        expectWellFormed(result, difficulty);
      }
    },
  );

  it(
    'gives byte-identical output for the same seed',
    { timeout: 120_000 },
    () => {
      const options = { difficulty, seed: 5, budgetMs: 60_000 };
      const first = generatePuzzle(options);
      const second = generatePuzzle(options);
      expect(first.exact).toBe(true);
      expect(Array.from(first.puzzle)).toEqual(Array.from(second.puzzle));
      expect(Array.from(first.solution)).toEqual(Array.from(second.solution));
    },
  );
});

describe('generatePuzzle options', () => {
  it('throws RangeError for an unknown difficulty', () => {
    // @ts-expect-error deliberately passing a bad runtime value
    expect(() => generatePuzzle({ difficulty: 'nightmare' })).toThrow(
      RangeError,
    );
  });

  it('picks and returns a random seed when none is given', () => {
    const result = generatePuzzle({ difficulty: 'easy' });
    expect(Number.isInteger(result.seed)).toBe(true);
    expectWellFormed(result, 'easy');
  });

  it('still returns a valid puzzle when the budget is already spent', () => {
    for (const difficulty of ['hard', 'expert'] as const) {
      const result = generatePuzzle({
        difficulty,
        seed: 3,
        budgetMs: 0,
        now: () => 0,
      });
      expectWellFormed(result, difficulty);
    }
  });

  it('uses the injected clock for the time budget', () => {
    let time = 0;
    const result = generatePuzzle({
      difficulty: 'hard',
      seed: 11,
      budgetMs: 1500,
      now: () => (time += 1000),
    });
    expectWellFormed(result, 'hard');
  });
});

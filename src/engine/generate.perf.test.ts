import { describe, expect, it } from 'vitest';

import { DEFAULT_BUDGET_MS } from './difficulty';
import { generatePuzzle } from './generate';
import { DIFFICULTIES } from './types';
import type { Difficulty } from './types';

/**
 * Generation speed. Skipped unless `npm run bench` sets VITE_ENGINE_BENCH, so
 * normal test runs stay fast. Prints a table and checks the speed targets.
 */
const ENABLED = import.meta.env.VITE_ENGINE_BENCH === '1';

const RUNS: Record<Difficulty, number> = {
  easy: 30,
  medium: 30,
  hard: 15,
  expert: 10,
};

/** Slack for the one attempt that can overshoot the time budget. */
const OVERSHOOT_MS = 500;

const percentile = (sorted: number[], fraction: number): number =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];

describe.skipIf(!ENABLED)('generation speed', () => {
  it('meets the speed targets', { timeout: 900_000 }, () => {
    const rows: Array<Record<string, string | number>> = [];
    const byDifficulty = new Map<Difficulty, number[]>();
    let seed = 1;

    for (const difficulty of DIFFICULTIES) {
      const times: number[] = [];
      let exact = 0;
      for (let run = 0; run < RUNS[difficulty]; run++) {
        const started = performance.now();
        const result = generatePuzzle({ difficulty, seed: seed++ });
        times.push(Math.round(performance.now() - started));
        if (result.exact) exact++;
      }
      times.sort((a, b) => a - b);
      byDifficulty.set(difficulty, times);
      rows.push({
        difficulty,
        runs: RUNS[difficulty],
        exact: `${exact}/${RUNS[difficulty]}`,
        medianMs: percentile(times, 0.5),
        p90Ms: percentile(times, 0.9),
        maxMs: times[times.length - 1],
      });
    }
    console.table(rows);

    const times = (difficulty: Difficulty): number[] =>
      byDifficulty.get(difficulty) ?? [];
    expect(percentile(times('easy'), 0.5)).toBeLessThan(100);
    expect(percentile(times('medium'), 0.5)).toBeLessThan(100);
    expect(percentile(times('hard'), 0.5)).toBeLessThan(1000);
    for (const difficulty of DIFFICULTIES) {
      const sorted = times(difficulty);
      expect(sorted[sorted.length - 1]).toBeLessThan(
        DEFAULT_BUDGET_MS[difficulty] + OVERSHOOT_MS,
      );
    }
  });
});

import { describe, expect, it } from 'vitest';

import { advancedSteps, tierOf } from '../difficulty';
import {
  CLASSIC_PUZZLE,
  CLASSIC_SOLUTION,
  parseGrid,
  SAMPLES,
} from '../fixtures';
import { countSolutions } from '../solver';
import { TECHNIQUES } from '../types';
import { gradePuzzle } from './grade';
import { PIPELINE } from './pipeline';

describe('PIPELINE', () => {
  it('lists the techniques in the same order as TECHNIQUES', () => {
    expect(PIPELINE.map((entry) => entry.technique)).toEqual([...TECHNIQUES]);
  });
});

describe('gradePuzzle', () => {
  it('rates the classic puzzle as singles only', () => {
    const rating = gradePuzzle(parseGrid(CLASSIC_PUZZLE));
    expect(rating).not.toBeNull();
    if (rating === null) return;
    expect(tierOf(rating)).toBe('easy');
    expect(rating.counts.nakedSingle + rating.counts.hiddenSingle).toBe(
      CLASSIC_PUZZLE.split('').filter((char) => char === '0').length,
    );
  });

  it('rates an already complete grid as nakedSingle with no steps', () => {
    const rating = gradePuzzle(parseGrid(CLASSIC_SOLUTION));
    expect(rating?.hardest).toBe('nakedSingle');
    expect(Object.values(rating?.counts ?? {}).every((n) => n === 0)).toBe(
      true,
    );
  });

  it('returns null when the givens contradict each other', () => {
    const grid = new Uint8Array(81);
    grid[0] = 5;
    grid[8] = 5;
    expect(gradePuzzle(grid)).toBeNull();
  });

  it('returns null when the puzzle cannot be solved without guessing', () => {
    expect(gradePuzzle(new Uint8Array(81))).toBeNull();
  });

  it('throws RangeError for a malformed grid', () => {
    expect(() => gradePuzzle(new Uint8Array(10))).toThrow(RangeError);
  });

  it.each(SAMPLES)('keeps rating the $difficulty sample the same', (sample) => {
    const puzzle = parseGrid(sample.puzzle);
    expect(countSolutions(puzzle)).toBe(1);
    const rating = gradePuzzle(puzzle);
    expect(rating).not.toBeNull();
    if (rating === null) return;
    expect(rating.hardest).toBe(sample.hardest);
    expect(advancedSteps(rating)).toBe(sample.advancedSteps);
    expect(tierOf(rating)).toBe(sample.difficulty);
  });
});

import { describe, expect, it } from 'vitest';

import {
  ADVANCED_STEPS_FOR_EXPERT,
  advancedSteps,
  CLUE_RANGE,
  compareTier,
  DEFAULT_BUDGET_MS,
  TIER_OF,
  tierOf,
} from './difficulty';
import { DIFFICULTIES, TECHNIQUES } from './types';
import type { Rating, Technique } from './types';

function rating(
  hardest: Technique,
  counts: Partial<Record<Technique, number>>,
): Rating {
  return {
    hardest,
    counts: {
      nakedSingle: 0,
      hiddenSingle: 0,
      lockedCandidates: 0,
      nakedPair: 0,
      hiddenPair: 0,
      nakedTriple: 0,
      hiddenTriple: 0,
      xWing: 0,
      xyWing: 0,
      swordfish: 0,
      ...counts,
    },
  };
}

describe('TIER_OF', () => {
  it('covers every technique', () => {
    expect(Object.keys(TIER_OF).sort()).toEqual([...TECHNIQUES].sort());
  });
});

describe('tierOf', () => {
  it('uses the hardest technique below the advanced ones', () => {
    expect(tierOf(rating('nakedSingle', { nakedSingle: 30 }))).toBe('easy');
    expect(tierOf(rating('hiddenSingle', { hiddenSingle: 5 }))).toBe('easy');
    expect(tierOf(rating('nakedPair', { nakedPair: 1 }))).toBe('medium');
    expect(tierOf(rating('hiddenTriple', { hiddenTriple: 1 }))).toBe('medium');
  });

  it('is Hard with exactly one advanced step', () => {
    expect(tierOf(rating('xWing', { xWing: 1 }))).toBe('hard');
    expect(tierOf(rating('xyWing', { xyWing: 1 }))).toBe('hard');
    expect(tierOf(rating('swordfish', { swordfish: 1 }))).toBe('hard');
  });

  it('is Expert with two or more advanced steps', () => {
    expect(ADVANCED_STEPS_FOR_EXPERT).toBe(2);
    expect(tierOf(rating('xyWing', { xWing: 1, xyWing: 1 }))).toBe('expert');
    expect(tierOf(rating('xWing', { xWing: 2 }))).toBe('expert');
  });
});

describe('advancedSteps', () => {
  it('adds X-wing, XY-wing and swordfish steps only', () => {
    expect(
      advancedSteps(
        rating('swordfish', {
          nakedSingle: 40,
          xWing: 1,
          xyWing: 2,
          swordfish: 1,
        }),
      ),
    ).toBe(4);
  });
});

describe('compareTier', () => {
  it('orders easy < medium < hard < expert', () => {
    expect(compareTier('easy', 'medium')).toBeLessThan(0);
    expect(compareTier('expert', 'hard')).toBeGreaterThan(0);
    expect(compareTier('hard', 'hard')).toBe(0);
  });
});

describe('tuning tables', () => {
  it('have an entry for every difficulty, with sane ranges', () => {
    for (const difficulty of DIFFICULTIES) {
      const { min, max } = CLUE_RANGE[difficulty];
      expect(min).toBeGreaterThanOrEqual(17);
      expect(max).toBeGreaterThanOrEqual(min);
      expect(DEFAULT_BUDGET_MS[difficulty]).toBeGreaterThan(0);
    }
  });

  it('asks for fewer clues as difficulty rises', () => {
    expect(CLUE_RANGE.easy.min).toBeGreaterThan(CLUE_RANGE.medium.min);
    expect(CLUE_RANGE.medium.min).toBeGreaterThan(CLUE_RANGE.hard.min);
    expect(CLUE_RANGE.hard.min).toBeGreaterThan(CLUE_RANGE.expert.min);
  });
});

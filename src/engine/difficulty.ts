import { DIFFICULTIES } from './types';
import type { Difficulty, Rating, Technique } from './types';

/** Tier of a puzzle whose hardest required technique is this one. */
export const TIER_OF: Record<Technique, Difficulty> = {
  nakedSingle: 'easy',
  hiddenSingle: 'easy',
  lockedCandidates: 'medium',
  nakedPair: 'medium',
  hiddenPair: 'medium',
  nakedTriple: 'medium',
  hiddenTriple: 'medium',
  xWing: 'hard',
  xyWing: 'hard',
  swordfish: 'hard',
};

export const ADVANCED_TECHNIQUES: readonly Technique[] = [
  'xWing',
  'xyWing',
  'swordfish',
];

/** A puzzle that needs this many advanced deductions or more is Expert. */
export const ADVANCED_STEPS_FOR_EXPERT = 2;

export function advancedSteps(rating: Rating): number {
  return ADVANCED_TECHNIQUES.reduce(
    (total, technique) => total + rating.counts[technique],
    0,
  );
}

/**
 * Easy and Medium come from the hardest technique used. Past that, difficulty
 * is how many advanced deductions (X-wing, XY-wing, swordfish) are needed:
 * one is Hard, two or more is Expert.
 */
export function tierOf(rating: Rating): Difficulty {
  if (advancedSteps(rating) >= ADVANCED_STEPS_FOR_EXPERT) return 'expert';
  return TIER_OF[rating.hardest];
}

/** Negative when `a` is easier than `b`, positive when harder, 0 when equal. */
export function compareTier(a: Difficulty, b: Difficulty): number {
  return DIFFICULTIES.indexOf(a) - DIFFICULTIES.indexOf(b);
}

/**
 * Clue counts to aim for. The generator picks a random goal inside the range
 * and starts grading once the puzzle is close to it.
 */
export const CLUE_RANGE: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 36, max: 45 },
  medium: { min: 30, max: 35 },
  hard: { min: 26, max: 30 },
  expert: { min: 20, max: 24 },
};

/** Initial values. Tune them with `npm run bench`. */
export const DEFAULT_BUDGET_MS: Record<Difficulty, number> = {
  easy: 1500,
  medium: 1500,
  hard: 2000,
  expert: 3000,
};

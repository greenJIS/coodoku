export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Ordered cheapest to hardest. The grader tries them in this order. */
export const TECHNIQUES = [
  'nakedSingle',
  'hiddenSingle',
  'lockedCandidates',
  'nakedPair',
  'hiddenPair',
  'nakedTriple',
  'hiddenTriple',
  'xWing',
  'xyWing',
  'swordfish',
] as const;
export type Technique = (typeof TECHNIQUES)[number];

/** 81 cells, row-major, 0 = empty. */
export type Grid = Uint8Array;

export interface CellDigit {
  cell: number;
  digit: number;
}

/** One logical deduction: digits to place and/or candidates to eliminate. */
export interface Step {
  technique: Technique;
  placements: CellDigit[];
  eliminations: CellDigit[];
}

export interface Rating {
  hardest: Technique;
  counts: Record<Technique, number>;
}

export interface Puzzle {
  puzzle: Grid;
  solution: Grid;
  /** The tier that was requested. */
  difficulty: Difficulty;
  /** False when generation timed out and a lower tier was returned. */
  exact: boolean;
  rating: Rating;
  seed: number;
}

import type { Difficulty, Grid, Technique } from './types';

/** A well-known easy puzzle that only needs singles. */
export const CLASSIC_PUZZLE =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
export const CLASSIC_SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

export function parseGrid(text: string): Grid {
  return Uint8Array.from(text, (char) => Number(char));
}

export function gridToString(grid: Grid): string {
  return Array.from(grid).join('');
}

export interface Sample {
  difficulty: Difficulty;
  puzzle: string;
  solution: string;
  hardest: Technique;
  /** Number of X-wing, XY-wing and swordfish steps the grader needs. */
  advancedSteps: number;
}

/**
 * Puzzles produced by the generator (seed 2024). They pin the grader's
 * behavior: if a technique changes, these ratings change.
 */
export const SAMPLES: Sample[] = [
  {
    difficulty: 'easy',
    puzzle:
      '504608109806294000200053864009400607700936200652080003005002080100809002928010346',
    solution:
      '534678129816294735297153864389425617741936258652781493475362981163849572928517346',
    hardest: 'nakedSingle',
    advancedSteps: 0,
  },
  {
    difficulty: 'medium',
    puzzle:
      '004008009806000000000050060000400600700930200050080003000002080100009002908010300',
    solution:
      '534678129816294735297153864389425617741936258652781493475362981163849572928517346',
    hardest: 'lockedCandidates',
    advancedSteps: 0,
  },
  {
    difficulty: 'hard',
    puzzle:
      '070060409300200000006001000802040070037000001090020040140007300000900500500000000',
    solution:
      '275368419314279658986451732852146973437895261691723845149587326763912584528634197',
    hardest: 'xyWing',
    advancedSteps: 1,
  },
  {
    difficulty: 'expert',
    puzzle:
      '000800100900000040080309005000020050001000300000603420708901000090030000002400003',
    solution:
      '576842139913765842284319675347128956621594387859673421738951264495236718162487593',
    hardest: 'xyWing',
    advancedSteps: 2,
  },
];

const FULL_RUN = import.meta.env.VITE_ENGINE_FULL === '1';

/**
 * How many seeds a property test loops over. Hooks run a tenth of the full
 * count to stay fast; `npm run test:full` runs all of them.
 */
export function seedCount(full: number): number {
  return FULL_RUN ? full : Math.max(2, Math.ceil(full / 10));
}

import { assertGrid } from '../grid';
import type { Grid, Rating, Step, Technique } from '../types';
import { applyStep, createState, hasDeadCell, isSolved } from './candidates';
import { PIPELINE } from './pipeline';

function emptyCounts(): Record<Technique, number> {
  return {
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
  };
}

/**
 * Solves the puzzle the way a person would, always using the cheapest
 * technique that applies. Returns which techniques it needed, or null when
 * the puzzle is contradictory or cannot be solved without guessing.
 * A grid that is already complete rates as `nakedSingle` with zero counts.
 */
export function gradePuzzle(grid: Grid): Rating | null {
  assertGrid(grid);
  const state = createState(grid);
  if (state === null) return null;

  const counts = emptyCounts();
  let hardest = 0;

  while (!isSolved(state)) {
    let step: Step | null = null;
    let level = 0;
    for (; level < PIPELINE.length; level++) {
      step = PIPELINE[level].apply(state);
      if (step !== null) break;
    }
    if (step === null) return null;

    applyStep(state, step);
    if (hasDeadCell(state)) return null;
    counts[step.technique]++;
    hardest = Math.max(hardest, level);
  }

  return { hardest: PIPELINE[hardest].technique, counts };
}

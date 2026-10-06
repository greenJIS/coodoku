import type { Step, Technique } from '../types';
import type { State } from './candidates';
import { swordfish, xWing } from './techniques/fish';
import { hiddenSingle } from './techniques/hiddenSingle';
import { hiddenPair, hiddenTriple } from './techniques/hiddenSubset';
import { lockedCandidates } from './techniques/lockedCandidates';
import { nakedSingle } from './techniques/nakedSingle';
import { nakedPair, nakedTriple } from './techniques/nakedSubset';
import { xyWing } from './techniques/xyWing';

export interface PipelineEntry {
  technique: Technique;
  apply: (state: State) => Step | null;
}

/** Cheapest first. Must stay in the same order as TECHNIQUES in types.ts. */
export const PIPELINE: readonly PipelineEntry[] = [
  { technique: 'nakedSingle', apply: nakedSingle },
  { technique: 'hiddenSingle', apply: hiddenSingle },
  { technique: 'lockedCandidates', apply: lockedCandidates },
  { technique: 'nakedPair', apply: nakedPair },
  { technique: 'hiddenPair', apply: hiddenPair },
  { technique: 'nakedTriple', apply: nakedTriple },
  { technique: 'hiddenTriple', apply: hiddenTriple },
  { technique: 'xWing', apply: xWing },
  { technique: 'xyWing', apply: xyWing },
  { technique: 'swordfish', apply: swordfish },
];

import type { Difficulty } from '../engine';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Change {
  cell: number;
  prevValue: number;
  prevNotes: number;
}

export interface RuleOptions {
  mistakeCheck: boolean;
  autoRemoveNotes: boolean;
}

export interface GameState {
  givens: number[];
  solution: number[];
  difficulty: Difficulty;
  seed: number;
  exact: boolean;
  name: string;
  values: number[];
  notes: number[];
  hearts: number;
  hintsLeft: number;
  elapsedMs: number;
  status: GameStatus;
  history: Change[][];
}

import type { Puzzle } from '../engine';
import type { GameState } from './types';

const range = (length: number): number[] => Array.from({ length }, (_, i) => i);

const ROW_OF = Uint8Array.from(range(81), (i) => Math.floor(i / 9));
const COL_OF = Uint8Array.from(range(81), (i) => i % 9);
const BOX_OF = Uint8Array.from(
  range(81),
  (i) => Math.floor(ROW_OF[i] / 3) * 3 + Math.floor(COL_OF[i] / 3),
);

const PEERS: number[][] = range(81).map((cell) =>
  range(81).filter(
    (other) =>
      other !== cell &&
      (ROW_OF[other] === ROW_OF[cell] ||
        COL_OF[other] === COL_OF[cell] ||
        BOX_OF[other] === BOX_OF[cell]),
  ),
);

export function row(cell: number): number {
  return ROW_OF[cell];
}

export function col(cell: number): number {
  return COL_OF[cell];
}

export function box(cell: number): number {
  return BOX_OF[cell];
}

export function peers(cell: number): readonly number[] {
  return PEERS[cell];
}

export function hasNote(mask: number, digit: number): boolean {
  return (mask & (1 << digit)) !== 0;
}

export function toggleBit(mask: number, digit: number): number {
  return mask ^ (1 << digit);
}

export function clearBit(mask: number, digit: number): number {
  return mask & ~(1 << digit);
}

export function setBit(mask: number, digit: number): number {
  return mask | (1 << digit);
}

export function digitsOf(mask: number): number[] {
  const digits: number[] = [];
  for (let digit = 1; digit <= 9; digit++) {
    if (hasNote(mask, digit)) digits.push(digit);
  }
  return digits;
}

export function createGame(puzzle: Puzzle, name: string): GameState {
  const puzzleRecord = puzzle as unknown as { givens?: Iterable<number> };
  const givens = Array.from(puzzleRecord.givens ?? puzzle.puzzle);
  return {
    givens,
    solution: Array.from(puzzle.solution),
    difficulty: puzzle.difficulty,
    seed: puzzle.seed,
    exact: puzzle.exact,
    name,
    values: [...givens],
    notes: new Array<number>(81).fill(0),
    hearts: 5,
    hintsLeft: 5,
    elapsedMs: 0,
    status: 'playing',
    history: [],
  };
}

import { ALL_DIGITS, bit } from '../bits';
import type { Grid, Step } from '../types';
import { PEERS } from '../units';

/** Grader working state: digits placed so far plus candidate masks. */
export interface State {
  cells: Uint8Array;
  /** Bit `d` set means digit `d` is still possible. Filled cells hold 0. */
  cands: Uint16Array;
}

/** Null when the givens contradict each other or leave a cell with no options. */
export function createState(grid: Grid): State | null {
  const cells = Uint8Array.from(grid);
  const cands = new Uint16Array(81);
  for (let cell = 0; cell < 81; cell++) {
    if (cells[cell] === 0) cands[cell] = ALL_DIGITS;
  }
  for (let cell = 0; cell < 81; cell++) {
    const digit = cells[cell];
    if (digit === 0) continue;
    for (const peer of PEERS[cell]) {
      if (cells[peer] === digit) return null;
      cands[peer] &= ~bit(digit);
    }
  }
  const state: State = { cells, cands };
  return hasDeadCell(state) ? null : state;
}

export function place(state: State, cell: number, digit: number): void {
  state.cells[cell] = digit;
  state.cands[cell] = 0;
  for (const peer of PEERS[cell]) state.cands[peer] &= ~bit(digit);
}

export function eliminate(state: State, cell: number, digit: number): void {
  state.cands[cell] &= ~bit(digit);
}

export function applyStep(state: State, step: Step): void {
  for (const { cell, digit } of step.placements) place(state, cell, digit);
  for (const { cell, digit } of step.eliminations) {
    eliminate(state, cell, digit);
  }
}

export function isSolved(state: State): boolean {
  return state.cells.every((digit) => digit !== 0);
}

/** An empty cell with no candidates left: the puzzle is contradictory. */
export function hasDeadCell(state: State): boolean {
  for (let cell = 0; cell < 81; cell++) {
    if (state.cells[cell] === 0 && state.cands[cell] === 0) return true;
  }
  return false;
}

import { col, row } from './cells';
import type { GameState } from './types';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface CompletedUnits {
  row: boolean;
  col: boolean;
  box: boolean;
}

export function isWrong(state: GameState, cell: number): boolean {
  if (cell < 0 || cell >= 81) return false;
  const val = state.values[cell];
  return val !== 0 && val !== state.solution[cell];
}

export function remainingCount(state: GameState, digit: number): number {
  if (digit < 1 || digit > 9) return 0;
  let correctPlaced = 0;
  for (let c = 0; c < 81; c++) {
    if (state.values[c] === digit && state.solution[c] === digit) {
      correctPlaced++;
    }
  }
  return Math.max(0, 9 - correctPlaced);
}

export function hasProgress(state: GameState): boolean {
  for (let c = 0; c < 81; c++) {
    if (state.givens[c] === 0 && state.values[c] !== 0) return true;
    if (state.notes[c] !== 0) return true;
  }
  return false;
}

export function moveSelection(cell: number, dir: Direction): number {
  if (cell < 0 || cell >= 81) return 0;
  const r = row(cell);
  const c = col(cell);

  switch (dir) {
    case 'up':
      return Math.max(0, r - 1) * 9 + c;
    case 'down':
      return Math.min(8, r + 1) * 9 + c;
    case 'left':
      return r * 9 + Math.max(0, c - 1);
    case 'right':
      return r * 9 + Math.min(8, c + 1);
  }
}

export function completedUnits(state: GameState, cell: number): CompletedUnits {
  if (cell < 0 || cell >= 81) {
    return { row: false, col: false, box: false };
  }

  const r = row(cell);
  const c = col(cell);

  let rowComplete = true;
  for (let colIdx = 0; colIdx < 9; colIdx++) {
    const idx = r * 9 + colIdx;
    if (state.values[idx] !== state.solution[idx]) {
      rowComplete = false;
      break;
    }
  }

  let colComplete = true;
  for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
    const idx = rowIdx * 9 + c;
    if (state.values[idx] !== state.solution[idx]) {
      colComplete = false;
      break;
    }
  }

  let boxComplete = true;
  const startRow = Math.floor(r / 3) * 3;
  const startCol = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const idx = (startRow + dr) * 9 + (startCol + dc);
      if (state.values[idx] !== state.solution[idx]) {
        boxComplete = false;
        break;
      }
    }
    if (!boxComplete) break;
  }

  return {
    row: rowComplete,
    col: colComplete,
    box: boxComplete,
  };
}

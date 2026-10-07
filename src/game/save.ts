import { DIFFICULTIES } from '../engine';
import type { Difficulty } from '../engine';
import type { Change, GameState, GameStatus } from './types';

const VALID_STATUSES: readonly GameStatus[] = ['playing', 'won', 'lost'];
const ALL_NOTES_MASK = 0x3fe;

function isNumberArray(arr: unknown, len: number): arr is number[] {
  if (!Array.isArray(arr) || arr.length !== len) return false;
  return arr.every(
    (item) => typeof item === 'number' && Number.isInteger(item),
  );
}

function isValidSolution(grid: readonly number[]): boolean {
  if (grid.length !== 81) return false;
  for (let r = 0; r < 9; r++) {
    let rowMask = 0;
    let colMask = 0;
    for (let c = 0; c < 9; c++) {
      const rowDigit = grid[r * 9 + c];
      if (rowDigit < 1 || rowDigit > 9) return false;
      rowMask |= 1 << rowDigit;

      const colDigit = grid[c * 9 + r];
      if (colDigit < 1 || colDigit > 9) return false;
      colMask |= 1 << colDigit;
    }
    if (rowMask !== ALL_NOTES_MASK || colMask !== ALL_NOTES_MASK) return false;
  }

  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let boxMask = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const digit = grid[(br * 3 + r) * 9 + (bc * 3 + c)];
          if (digit < 1 || digit > 9) return false;
          boxMask |= 1 << digit;
        }
      }
      if (boxMask !== ALL_NOTES_MASK) return false;
    }
  }

  return true;
}

export function serialize(state: GameState): Record<string, unknown> {
  return {
    givens: [...state.givens],
    solution: [...state.solution],
    difficulty: state.difficulty,
    seed: state.seed,
    exact: state.exact,
    name: state.name,
    values: [...state.values],
    notes: [...state.notes],
    hearts: state.hearts,
    hintsLeft: state.hintsLeft,
    elapsedMs: state.elapsedMs,
    status: state.status,
    history: state.history.map((step) =>
      step.map((c) => ({
        cell: c.cell,
        prevValue: c.prevValue,
        prevNotes: c.prevNotes,
      })),
    ),
  };
}

export function parse(raw: unknown): GameState | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null;
  }

  const data = raw as Record<string, unknown>;

  // Difficulty
  if (
    typeof data.difficulty !== 'string' ||
    !DIFFICULTIES.includes(data.difficulty as Difficulty)
  ) {
    return null;
  }
  const difficulty = data.difficulty as Difficulty;

  // Seed & exact & name
  if (
    typeof data.seed !== 'number' ||
    !Number.isInteger(data.seed) ||
    typeof data.exact !== 'boolean' ||
    typeof data.name !== 'string' ||
    data.name.trim().length === 0
  ) {
    return null;
  }

  // Hearts & hintsLeft
  if (
    typeof data.hearts !== 'number' ||
    !Number.isInteger(data.hearts) ||
    data.hearts < 0 ||
    data.hearts > 5 ||
    typeof data.hintsLeft !== 'number' ||
    !Number.isInteger(data.hintsLeft) ||
    data.hintsLeft < 0 ||
    data.hintsLeft > 5
  ) {
    return null;
  }

  // ElapsedMs
  if (
    typeof data.elapsedMs !== 'number' ||
    Number.isNaN(data.elapsedMs) ||
    data.elapsedMs < 0
  ) {
    return null;
  }

  // Status
  if (
    typeof data.status !== 'string' ||
    !VALID_STATUSES.includes(data.status as GameStatus)
  ) {
    return null;
  }
  const status = data.status as GameStatus;

  // Arrays: givens, solution, values, notes
  if (
    !isNumberArray(data.givens, 81) ||
    !isNumberArray(data.solution, 81) ||
    !isNumberArray(data.values, 81) ||
    !isNumberArray(data.notes, 81)
  ) {
    return null;
  }

  // Digits validation
  for (let c = 0; c < 81; c++) {
    const given = data.givens[c];
    const sol = data.solution[c];
    const val = data.values[c];
    const note = data.notes[c];

    if (given < 0 || given > 9) return null;
    if (sol < 1 || sol > 9) return null;
    if (val < 0 || val > 9) return null;

    // Notes bitmask range (bits 1..9 only)
    if (note < 0 || (note & ~ALL_NOTES_MASK) !== 0) return null;

    // Givens must agree with solution
    if (given !== 0 && given !== sol) return null;

    // Givens must agree with values on given cells
    if (given !== 0 && val !== given) return null;
  }

  // Solution grid valid
  if (!isValidSolution(data.solution as number[])) {
    return null;
  }

  // History shape
  if (!Array.isArray(data.history)) {
    return null;
  }

  const history: Change[][] = [];
  for (const step of data.history) {
    if (!Array.isArray(step)) return null;
    const stepChanges: Change[] = [];
    for (const change of step) {
      if (
        typeof change !== 'object' ||
        change === null ||
        Array.isArray(change)
      ) {
        return null;
      }
      const ch = change as Record<string, unknown>;
      if (
        typeof ch.cell !== 'number' ||
        !Number.isInteger(ch.cell) ||
        ch.cell < 0 ||
        ch.cell >= 81 ||
        typeof ch.prevValue !== 'number' ||
        !Number.isInteger(ch.prevValue) ||
        ch.prevValue < 0 ||
        ch.prevValue > 9 ||
        typeof ch.prevNotes !== 'number' ||
        !Number.isInteger(ch.prevNotes) ||
        ch.prevNotes < 0 ||
        (ch.prevNotes & ~ALL_NOTES_MASK) !== 0
      ) {
        return null;
      }
      stepChanges.push({
        cell: ch.cell,
        prevValue: ch.prevValue,
        prevNotes: ch.prevNotes,
      });
    }
    history.push(stepChanges);
  }

  return {
    givens: [...data.givens],
    solution: [...data.solution],
    difficulty,
    seed: data.seed,
    exact: data.exact,
    name: data.name,
    values: [...data.values],
    notes: [...data.notes],
    hearts: data.hearts,
    hintsLeft: data.hintsLeft,
    elapsedMs: data.elapsedMs,
    status,
    history,
  };
}

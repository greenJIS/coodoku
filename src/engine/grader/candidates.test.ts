import { describe, expect, it } from 'vitest';

import { digitsOf } from '../bits';
import { CLASSIC_PUZZLE, CLASSIC_SOLUTION, parseGrid } from '../fixtures';
import {
  applyStep,
  createState,
  eliminate,
  hasDeadCell,
  isSolved,
  place,
} from './candidates';

describe('createState', () => {
  it('derives candidates from the givens', () => {
    const state = createState(parseGrid(CLASSIC_PUZZLE));
    expect(state).not.toBeNull();
    if (state === null) return;
    // Row 0 has 5, 3, 7; column 2 has 8; box 0 has 5, 3, 6, 9, 8.
    expect(digitsOf(state.cands[2])).toEqual([1, 2, 4]);
    expect(state.cands[0]).toBe(0);
  });

  it('returns null when two givens clash', () => {
    const grid = new Uint8Array(81);
    grid[0] = 5;
    grid[8] = 5;
    expect(createState(grid)).toBeNull();
  });

  it('returns null when a cell has no candidates left', () => {
    const grid = new Uint8Array(81);
    for (let c = 0; c < 8; c++) grid[c] = c + 1;
    grid[17] = 9;
    expect(createState(grid)).toBeNull();
  });
});

describe('place, eliminate, applyStep', () => {
  it('place fills the cell and removes the digit from its peers', () => {
    const state = createState(new Uint8Array(81));
    if (state === null) throw new Error('empty grid must be valid');
    place(state, 0, 7);
    expect(state.cells[0]).toBe(7);
    expect(state.cands[0]).toBe(0);
    expect(digitsOf(state.cands[1])).not.toContain(7);
    expect(digitsOf(state.cands[9])).not.toContain(7);
    expect(digitsOf(state.cands[80])).toContain(7);
  });

  it('eliminate removes one candidate', () => {
    const state = createState(new Uint8Array(81));
    if (state === null) throw new Error('empty grid must be valid');
    eliminate(state, 40, 3);
    expect(digitsOf(state.cands[40])).toEqual([1, 2, 4, 5, 6, 7, 8, 9]);
  });

  it('applyStep does placements and eliminations', () => {
    const state = createState(new Uint8Array(81));
    if (state === null) throw new Error('empty grid must be valid');
    applyStep(state, {
      technique: 'nakedSingle',
      placements: [{ cell: 0, digit: 1 }],
      eliminations: [{ cell: 80, digit: 9 }],
    });
    expect(state.cells[0]).toBe(1);
    expect(digitsOf(state.cands[80])).not.toContain(9);
  });
});

describe('isSolved and hasDeadCell', () => {
  it('isSolved is true only for a complete grid', () => {
    const solved = createState(parseGrid(CLASSIC_SOLUTION));
    const open = createState(parseGrid(CLASSIC_PUZZLE));
    expect(solved && isSolved(solved)).toBe(true);
    expect(open && isSolved(open)).toBe(false);
  });

  it('hasDeadCell finds an empty cell with no candidates', () => {
    const state = createState(new Uint8Array(81));
    if (state === null) throw new Error('empty grid must be valid');
    expect(hasDeadCell(state)).toBe(false);
    state.cands[10] = 0;
    expect(hasDeadCell(state)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { CLASSIC_PUZZLE, CLASSIC_SOLUTION, parseGrid } from './fixtures';
import { isValidSolution } from './grid';
import { createRng } from './rng';
import { countSolutions, solve } from './solver';

describe('countSolutions', () => {
  it('finds exactly one solution for a proper puzzle', () => {
    expect(countSolutions(parseGrid(CLASSIC_PUZZLE))).toBe(1);
  });

  it('counts a complete grid as one solution', () => {
    expect(countSolutions(parseGrid(CLASSIC_SOLUTION))).toBe(1);
  });

  it('stops at the limit', () => {
    expect(countSolutions(new Uint8Array(81), 2)).toBe(2);
    expect(countSolutions(new Uint8Array(81), 5)).toBe(5);
  });

  it('finds more than one solution when clues are missing', () => {
    const grid = new Uint8Array(81);
    grid[0] = 1;
    expect(countSolutions(grid, 2)).toBe(2);
  });

  it('returns 0 when the givens contradict each other', () => {
    const grid = new Uint8Array(81);
    grid[0] = 5;
    grid[8] = 5;
    expect(countSolutions(grid)).toBe(0);
  });

  it('returns 0 when a cell has no possible digit', () => {
    const grid = new Uint8Array(81);
    for (let c = 0; c < 8; c++) grid[c] = c + 1;
    grid[17] = 9;
    expect(countSolutions(grid)).toBe(0);
  });

  it('throws RangeError for a malformed grid', () => {
    expect(() => countSolutions(new Uint8Array(10))).toThrow(RangeError);
  });
});

describe('solve', () => {
  it('returns the solution of a proper puzzle', () => {
    const solved = solve(parseGrid(CLASSIC_PUZZLE));
    expect(solved).not.toBeNull();
    expect(Array.from(solved ?? [])).toEqual(
      Array.from(parseGrid(CLASSIC_SOLUTION)),
    );
  });

  it('does not change its input', () => {
    const grid = parseGrid(CLASSIC_PUZZLE);
    solve(grid);
    expect(Array.from(grid)).toEqual(Array.from(parseGrid(CLASSIC_PUZZLE)));
  });

  it('returns null for an unsolvable grid', () => {
    const grid = new Uint8Array(81);
    grid[0] = 5;
    grid[8] = 5;
    expect(solve(grid)).toBeNull();
  });

  it('builds a valid full grid from nothing, deterministically per seed', () => {
    const first = solve(new Uint8Array(81), createRng(1));
    const again = solve(new Uint8Array(81), createRng(1));
    const other = solve(new Uint8Array(81), createRng(2));
    expect(first).not.toBeNull();
    expect(isValidSolution(first ?? new Uint8Array(81))).toBe(true);
    expect(Array.from(first ?? [])).toEqual(Array.from(again ?? []));
    expect(Array.from(first ?? [])).not.toEqual(Array.from(other ?? []));
  });
});

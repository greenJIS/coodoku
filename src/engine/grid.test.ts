import { describe, expect, it } from 'vitest';

import {
  CLASSIC_PUZZLE,
  CLASSIC_SOLUTION,
  gridToString,
  parseGrid,
} from './fixtures';
import { assertGrid, clueCount, isValidSolution } from './grid';

describe('assertGrid', () => {
  it('accepts a well-formed grid', () => {
    expect(() => assertGrid(parseGrid(CLASSIC_PUZZLE))).not.toThrow();
  });

  it('throws RangeError for the wrong length', () => {
    expect(() => assertGrid(new Uint8Array(80))).toThrow(RangeError);
    expect(() => assertGrid(new Uint8Array(82))).toThrow(RangeError);
  });

  it('throws RangeError for a digit above 9', () => {
    const grid = new Uint8Array(81);
    grid[40] = 10;
    expect(() => assertGrid(grid)).toThrow(RangeError);
  });
});

describe('clueCount', () => {
  it('counts non-zero cells', () => {
    expect(clueCount(parseGrid(CLASSIC_PUZZLE))).toBe(
      CLASSIC_PUZZLE.replaceAll('0', '').length,
    );
    expect(clueCount(new Uint8Array(81))).toBe(0);
  });
});

describe('isValidSolution', () => {
  it('accepts a correct complete grid', () => {
    expect(isValidSolution(parseGrid(CLASSIC_SOLUTION))).toBe(true);
  });

  it('rejects a grid with empty cells', () => {
    expect(isValidSolution(parseGrid(CLASSIC_PUZZLE))).toBe(false);
  });

  it('rejects a grid with a repeated digit', () => {
    const grid = parseGrid(CLASSIC_SOLUTION);
    grid[0] = grid[1];
    expect(isValidSolution(grid)).toBe(false);
  });

  it('rejects the wrong length', () => {
    expect(isValidSolution(new Uint8Array(80))).toBe(false);
  });

  it('round-trips through gridToString', () => {
    expect(gridToString(parseGrid(CLASSIC_SOLUTION))).toBe(CLASSIC_SOLUTION);
  });
});

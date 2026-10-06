import { describe, expect, it } from 'vitest';

import { BOXES, COLS, PEERS, ROWS, UNITS } from './units';

describe('units', () => {
  it('has 9 rows, 9 columns and 9 boxes of 9 cells', () => {
    for (const group of [ROWS, COLS, BOXES]) {
      expect(group).toHaveLength(9);
      for (const unit of group) expect(unit).toHaveLength(9);
    }
    expect(UNITS).toHaveLength(27);
  });

  it('puts every cell in exactly one row, one column and one box', () => {
    const all = Array.from({ length: 81 }, (_, i) => i);
    for (const group of [ROWS, COLS, BOXES]) {
      expect(group.flat().sort((a, b) => a - b)).toEqual(all);
    }
  });

  it('lists the centre box as rows 3-5, columns 3-5', () => {
    expect(BOXES[4]).toEqual([30, 31, 32, 39, 40, 41, 48, 49, 50]);
  });

  it('gives every cell 20 distinct peers, never itself', () => {
    for (let cell = 0; cell < 81; cell++) {
      expect(PEERS[cell]).toHaveLength(20);
      expect(new Set(PEERS[cell]).size).toBe(20);
      expect(PEERS[cell]).not.toContain(cell);
    }
  });

  it('is symmetric: if a sees b then b sees a', () => {
    for (let a = 0; a < 81; a++) {
      for (const b of PEERS[a]) expect(PEERS[b]).toContain(a);
    }
  });
});

const range = (length: number): number[] => Array.from({ length }, (_, i) => i);

export const ROW_OF = Uint8Array.from(range(81), (i) => Math.floor(i / 9));
export const COL_OF = Uint8Array.from(range(81), (i) => i % 9);
export const BOX_OF = Uint8Array.from(
  range(81),
  (i) => Math.floor(ROW_OF[i] / 3) * 3 + Math.floor(COL_OF[i] / 3),
);

export const ROWS: number[][] = range(9).map((r) =>
  range(9).map((c) => r * 9 + c),
);
export const COLS: number[][] = range(9).map((c) =>
  range(9).map((r) => r * 9 + c),
);
export const BOXES: number[][] = range(9).map((b) =>
  range(81).filter((cell) => BOX_OF[cell] === b),
);

/** All 27 units: rows, then columns, then boxes. */
export const UNITS: number[][] = [...ROWS, ...COLS, ...BOXES];

/** For each cell, the 20 other cells that share a row, column, or box. */
export const PEERS: number[][] = range(81).map((cell) =>
  range(81).filter(
    (other) =>
      other !== cell &&
      (ROW_OF[other] === ROW_OF[cell] ||
        COL_OF[other] === COL_OF[cell] ||
        BOX_OF[other] === BOX_OF[cell]),
  ),
);

import { describe, expect, it } from 'vitest';

import { combinations } from './combinations';

describe('combinations', () => {
  it('lists every choice in original order', () => {
    expect(combinations([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ]);
  });

  it('returns one empty choice for size 0', () => {
    expect(combinations([1, 2], 0)).toEqual([[]]);
  });

  it('returns nothing when size exceeds the items', () => {
    expect(combinations([1, 2], 3)).toEqual([]);
  });

  it('counts C(9,3) = 84', () => {
    expect(combinations([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toHaveLength(84);
  });
});

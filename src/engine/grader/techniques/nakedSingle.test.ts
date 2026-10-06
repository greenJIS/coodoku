import { describe, expect, it } from 'vitest';

import { makeState } from '../testing';
import { nakedSingle } from './nakedSingle';

describe('nakedSingle', () => {
  it('places the only candidate of a cell', () => {
    const step = nakedSingle(makeState({ 10: [5] }));
    expect(step).toEqual({
      technique: 'nakedSingle',
      placements: [{ cell: 10, digit: 5 }],
      eliminations: [],
    });
  });

  it('ignores cells with two or more candidates', () => {
    expect(nakedSingle(makeState({ 10: [5, 6] }))).toBeNull();
  });

  it('ignores a board with no empty cells', () => {
    expect(nakedSingle(makeState({}))).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { createState } from './candidates';
import { cloneGraderState, createGraderState } from './state';

describe('state compatibility and helpers', () => {
  it('createGraderState aliases createState', () => {
    expect(createGraderState).toBe(createState);
  });

  it('cloneGraderState creates independent deep copy of arrays', () => {
    const state = createState(new Uint8Array(81));
    if (state === null) throw new Error('empty grid must be valid');
    const clone = cloneGraderState(state);
    expect(clone.cells).not.toBe(state.cells);
    expect(clone.cands).not.toBe(state.cands);
    expect(clone.cells).toEqual(state.cells);
    expect(clone.cands).toEqual(state.cands);

    clone.cells[0] = 5;
    expect(state.cells[0]).toBe(0);
  });
});

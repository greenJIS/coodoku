import { describe, expect, it } from 'vitest';

import { compareTier } from './difficulty';
import { EngineError } from './errors';
import { seedCount } from './fixtures';
import { carve, fullGrid } from './generator';
import { isValidSolution } from './grid';
import { createRng, deriveSeed } from './rng';
import { countSolutions } from './solver';
import { DIFFICULTIES } from './types';

describe('EngineError', () => {
  it('has name EngineError and accepts ErrorOptions', () => {
    const error = new EngineError('failed', { cause: new Error('inner') });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EngineError);
    expect(error.name).toBe('EngineError');
    expect(error.message).toBe('failed');
    expect(error.cause).toBeDefined();
  });
});

describe('fullGrid', () => {
  it('builds a valid complete grid', () => {
    expect(isValidSolution(fullGrid(createRng(1)))).toBe(true);
  });

  it('is deterministic for a seed', () => {
    expect(Array.from(fullGrid(createRng(8)))).toEqual(
      Array.from(fullGrid(createRng(8))),
    );
  });
});

describe('carve', () => {
  it.each(DIFFICULTIES)('only returns valid %s candidates', (target) => {
    for (let attempt = 0; attempt < seedCount(30); attempt++) {
      const rng = createRng(deriveSeed(77, attempt));
      const solution = fullGrid(rng);
      const { accepted, best } = carve(solution, rng, target);

      for (const candidate of [accepted, best]) {
        if (candidate === null) continue;
        expect(countSolutions(candidate.puzzle, 2)).toBe(1);
        for (let cell = 0; cell < 81; cell++) {
          if (candidate.puzzle[cell] !== 0) {
            expect(candidate.puzzle[cell]).toBe(solution[cell]);
          }
        }
        expect(compareTier(candidate.tier, target)).toBeLessThanOrEqual(0);
      }
      if (accepted !== null) expect(accepted.tier).toBe(target);
    }
  });

  it('always reaches the target for Easy', () => {
    for (let attempt = 0; attempt < seedCount(30); attempt++) {
      const rng = createRng(deriveSeed(5, attempt));
      const { accepted } = carve(fullGrid(rng), rng, 'easy');
      expect(accepted).not.toBeNull();
    }
  });

  it('stops at once when asked to', () => {
    const rng = createRng(3);
    const outcome = carve(fullGrid(rng), rng, 'expert', () => true);
    expect(outcome).toEqual({ accepted: null, best: null });
  });
});

import { describe, expect, it } from 'vitest';

import { createRng, deriveSeed, randomSeed } from './rng';

const draw = (seed: number, count: number): number[] => {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng.next());
};

describe('createRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(draw(42, 20)).toEqual(draw(42, 20));
  });

  it('gives different sequences for different seeds', () => {
    expect(draw(1, 20)).not.toEqual(draw(2, 20));
  });

  it('next() stays in [0, 1)', () => {
    for (const value of draw(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('int(max) stays in [0, max) and reaches every value', () => {
    const rng = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const value = rng.int(10);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(10);
      seen.add(value);
    }
    expect(seen.size).toBe(10);
  });

  it('shuffle keeps the same items, in place', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = createRng(5).shuffle(items);
    expect(result).toBe(items);
    expect([...items].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('shuffle is deterministic for a seed and actually reorders', () => {
    const first = createRng(9).shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
    const second = createRng(9).shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(first).toEqual(second);
    expect(first).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('deriveSeed', () => {
  it('is deterministic and differs for each attempt', () => {
    expect(deriveSeed(10, 0)).toBe(deriveSeed(10, 0));
    const seeds = new Set([0, 1, 2, 3, 4].map((a) => deriveSeed(10, a)));
    expect(seeds.size).toBe(5);
  });
});

describe('randomSeed', () => {
  it('returns an unsigned 32-bit integer', () => {
    const seed = randomSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });
});

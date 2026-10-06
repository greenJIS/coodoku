export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [0, max). */
  int(max: number): number;
  /** Fisher-Yates shuffle, in place. Returns the same array. */
  shuffle<T>(items: T[]): T[];
}

/** mulberry32: a small, fast, seedable generator. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (max) => Math.floor(next() * max),
    shuffle: (items) => {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const held = items[i];
        items[i] = items[j];
        items[j] = held;
      }
      return items;
    },
  };
}

/** A different, reproducible seed for each generation attempt. */
export function deriveSeed(seed: number, attempt: number): number {
  return (seed + Math.imul(attempt + 1, 0x9e3779b1)) >>> 0;
}

export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

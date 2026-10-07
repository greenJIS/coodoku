import { describe, expect, it } from 'vitest';
import { ADJECTIVES, ANIMALS, randomName } from './names';

describe('randomName', () => {
  it('is deterministic when provided a seeded rng', () => {
    // rng returns 0 -> first adjective and first animal
    const name0 = randomName(() => 0);
    expect(name0).toBe(`${ADJECTIVES[0]} ${ANIMALS[0]}`);

    // rng returns 0.999 -> last adjective and last animal
    const nameLast = randomName(() => 0.999);
    expect(nameLast).toBe(
      `${ADJECTIVES[ADJECTIVES.length - 1]} ${ANIMALS[ANIMALS.length - 1]}`,
    );

    // Sequence generator
    let i = 0;
    const seq = [0.1, 0.5];
    const nameSeq = randomName(() => seq[i++ % seq.length]);
    expect(nameSeq).toBe(
      `${ADJECTIVES[Math.floor(0.1 * ADJECTIVES.length)]} ${ANIMALS[Math.floor(0.5 * ANIMALS.length)]}`,
    );
  });

  it('works with default Math.random', () => {
    const name = randomName();
    expect(typeof name).toBe('string');
    const parts = name.split(' ');
    expect(parts.length).toBe(2);
    expect(ADJECTIVES).toContain(parts[0]);
    expect(ANIMALS).toContain(parts[1]);
  });
});

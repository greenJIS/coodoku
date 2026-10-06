import { bit } from '../bits';
import type { State } from './candidates';

/**
 * Test helper. Builds a state where only the listed cells are empty, with the
 * given candidates. Every other cell counts as filled, so a technique under
 * test sees exactly the cells the test describes.
 */
export function makeState(candidates: Record<number, number[]>): State {
  const cells = new Uint8Array(81).fill(1);
  const cands = new Uint16Array(81);
  for (const [key, digits] of Object.entries(candidates)) {
    const cell = Number(key);
    cells[cell] = 0;
    cands[cell] = digits.reduce((mask, digit) => mask | bit(digit), 0);
  }
  return { cells, cands };
}

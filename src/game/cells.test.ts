import { describe, expect, it } from 'vitest';
import type { Puzzle } from '../engine';
import {
  box,
  clearBit,
  col,
  createGame,
  hasNote,
  peers,
  row,
  setBit,
  toggleBit,
} from './cells';

describe('cells helpers', () => {
  it('precomputes row, col, and box correctly', () => {
    expect(row(0)).toBe(0);
    expect(col(0)).toBe(0);
    expect(box(0)).toBe(0);

    expect(row(80)).toBe(8);
    expect(col(80)).toBe(8);
    expect(box(80)).toBe(8);

    // Cell 30: row 3, col 3, box 4
    expect(row(30)).toBe(3);
    expect(col(30)).toBe(3);
    expect(box(30)).toBe(4);
  });

  it('guarantees each of the 81 cells has exactly 20 peers', () => {
    for (let cell = 0; cell < 81; cell++) {
      const p = peers(cell);
      expect(p.length).toBe(20);
      expect(p.includes(cell)).toBe(false);

      // Unique peers
      const unique = new Set(p);
      expect(unique.size).toBe(20);

      // Every peer shares row, col, or box
      for (const peerCell of p) {
        const sharesUnit =
          row(peerCell) === row(cell) ||
          col(peerCell) === col(cell) ||
          box(peerCell) === box(cell);
        expect(sharesUnit).toBe(true);
      }
    }
  });

  it('handles notes bit layout correctly', () => {
    let mask = 0;
    expect(hasNote(mask, 1)).toBe(false);

    mask = toggleBit(mask, 3);
    expect(hasNote(mask, 3)).toBe(true);
    expect(mask).toBe(1 << 3);

    mask = toggleBit(mask, 3);
    expect(hasNote(mask, 3)).toBe(false);
    expect(mask).toBe(0);

    mask = setBit(mask, 9);
    expect(hasNote(mask, 9)).toBe(true);
    mask = clearBit(mask, 9);
    expect(hasNote(mask, 9)).toBe(false);
    expect(mask).toBe(0);
  });

  it('creates fresh GameState from puzzle and name', () => {
    const mockPuzzle: Puzzle = {
      puzzle: new Uint8Array(81).fill(0),
      solution: new Uint8Array(81).fill(1),
      difficulty: 'hard',
      exact: false,
      seed: 42,
      rating: { hardest: 'xWing', counts: { xWing: 1 } as never },
    };
    mockPuzzle.puzzle[0] = 1;

    const game = createGame(mockPuzzle, 'happy otter');
    expect(game.name).toBe('happy otter');
    expect(game.difficulty).toBe('hard');
    expect(game.seed).toBe(42);
    expect(game.exact).toBe(false);
    expect(game.hearts).toBe(5);
    expect(game.hintsLeft).toBe(5);
    expect(game.elapsedMs).toBe(0);
    expect(game.status).toBe('playing');
    expect(game.history).toEqual([]);
    expect(game.givens[0]).toBe(1);
    expect(game.values[0]).toBe(1);
    expect(game.notes.every((n) => n === 0)).toBe(true);
    expect(game.values).not.toBe(game.givens);
  });
});

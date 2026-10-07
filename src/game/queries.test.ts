import { describe, expect, it } from 'vitest';
import type { Puzzle } from '../engine';
import { createGame } from './cells';
import {
  completedUnits,
  hasProgress,
  isWrong,
  moveSelection,
  remainingCount,
} from './queries';
import { placeDigit, toggleNote } from './rules';
import type { GameState } from './types';

function makeTestGame(): GameState {
  const solution = new Uint8Array(81).fill(1);
  const puzzle = new Uint8Array(81).fill(0);
  puzzle[0] = 1; // cell 0 is given
  const mock: Puzzle = {
    puzzle,
    solution,
    difficulty: 'easy',
    exact: true,
    seed: 123,
    rating: { hardest: 'nakedSingle', counts: {} as never },
  };
  return createGame(mock, 'calm otter');
}

describe('game queries', () => {
  it('isWrong identifies incorrect non-zero values', () => {
    let game = makeTestGame();
    expect(isWrong(game, 0)).toBe(false); // given 1 == solution 1
    expect(isWrong(game, 1)).toBe(false); // empty 0

    game = placeDigit(game, 1, 9, {
      mistakeCheck: false,
      autoRemoveNotes: false,
    });
    expect(isWrong(game, 1)).toBe(true);

    game = placeDigit(game, 1, 1, {
      mistakeCheck: false,
      autoRemoveNotes: false,
    });
    expect(isWrong(game, 1)).toBe(false);

    expect(isWrong(game, -1)).toBe(false);
    expect(isWrong(game, 99)).toBe(false);
  });

  it('remainingCount counts only correct placements', () => {
    let game = makeTestGame();
    // Initially cell 0 is given 1, so 8 remaining 1s
    expect(remainingCount(game, 1)).toBe(8);
    expect(remainingCount(game, 2)).toBe(9);

    // Place wrong digit 2 at cell 1 (solution is 1)
    game = placeDigit(game, 1, 2, {
      mistakeCheck: false,
      autoRemoveNotes: false,
    });
    expect(remainingCount(game, 2)).toBe(9); // Not counted because wrong

    // Place correct digit 1 at cell 2
    game = placeDigit(game, 2, 1, {
      mistakeCheck: false,
      autoRemoveNotes: false,
    });
    expect(remainingCount(game, 1)).toBe(7);
  });

  it('hasProgress returns true only when player made moves or notes', () => {
    const game = makeTestGame();
    expect(hasProgress(game)).toBe(false);

    // Note added
    const withNote = toggleNote(game, 1, 5);
    expect(hasProgress(withNote)).toBe(true);

    // Digit added
    const withDigit = placeDigit(game, 1, 1, {
      mistakeCheck: true,
      autoRemoveNotes: false,
    });
    expect(hasProgress(withDigit)).toBe(true);
  });

  it('moveSelection clamps and never wraps', () => {
    // Cell 0: row 0, col 0
    expect(moveSelection(0, 'up')).toBe(0);
    expect(moveSelection(0, 'left')).toBe(0);
    expect(moveSelection(0, 'right')).toBe(1);
    expect(moveSelection(0, 'down')).toBe(9);

    // Cell 8: row 0, col 8
    expect(moveSelection(8, 'right')).toBe(8); // no wrap to cell 9
    expect(moveSelection(8, 'left')).toBe(7);
    expect(moveSelection(8, 'up')).toBe(8);
    expect(moveSelection(8, 'down')).toBe(17);

    // Cell 80: row 8, col 8
    expect(moveSelection(80, 'right')).toBe(80);
    expect(moveSelection(80, 'down')).toBe(80);
    expect(moveSelection(80, 'up')).toBe(71);
    expect(moveSelection(80, 'left')).toBe(79);
  });

  it('completedUnits checks row, column, and box completion', () => {
    let game = makeTestGame();
    // Initially incomplete
    expect(completedUnits(game, 0)).toEqual({
      row: false,
      col: false,
      box: false,
    });

    // Fill row 0 (cells 0 to 8)
    const rowValues = [...game.values];
    for (let c = 0; c < 9; c++) {
      rowValues[c] = 1;
    }
    game = { ...game, values: rowValues };
    expect(completedUnits(game, 0)).toEqual({
      row: true,
      col: false,
      box: false,
    });

    // Fill col 0 (cells 0, 9, 18, 27, 36, 45, 54, 63, 72)
    const colValues = [...game.values];
    for (let r = 0; r < 9; r++) {
      colValues[r * 9] = 1;
    }
    game = { ...game, values: colValues };
    expect(completedUnits(game, 0)).toEqual({
      row: true,
      col: true,
      box: false,
    });

    // Fill box 0 (rows 0-2, cols 0-2: 0,1,2, 9,10,11, 18,19,20)
    const boxValues = [...game.values];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        boxValues[r * 9 + c] = 1;
      }
    }
    game = { ...game, values: boxValues };
    expect(completedUnits(game, 0)).toEqual({
      row: true,
      col: true,
      box: true,
    });

    // Incomplete if one value is wrong
    boxValues[20] = 9; // wrong
    game = { ...game, values: boxValues };
    expect(completedUnits(game, 0).box).toBe(false);
  });
});

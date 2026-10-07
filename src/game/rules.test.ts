import { describe, expect, it } from 'vitest';
import type { Puzzle } from '../engine';
import { createGame, hasNote, peers, toggleBit } from './cells';
import { erase, placeDigit, revealHint, tick, toggleNote, undo } from './rules';
import type { GameState, RuleOptions } from './types';

function makeTestGame(): GameState {
  // 81-cell solution of 1s
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

const defaultOpts: RuleOptions = {
  mistakeCheck: true,
  autoRemoveNotes: true,
};

describe('game rules', () => {
  it('locks given cells from placeDigit', () => {
    const game = makeTestGame();
    const next = placeDigit(game, 0, 9, defaultOpts);
    expect(next).toBe(game);
    expect(next.values[0]).toBe(1);
  });

  it('no-ops on placing same digit already present in cell', () => {
    let game = makeTestGame();
    // cell 1 empty, place 9 with mistakeCheck off
    game = placeDigit(game, 1, 9, { ...defaultOpts, mistakeCheck: false });
    const next = placeDigit(game, 1, 9, {
      ...defaultOpts,
      mistakeCheck: false,
    });
    expect(next).toBe(game);
  });

  it('places correct digit', () => {
    const game = makeTestGame();
    const next = placeDigit(game, 1, 1, defaultOpts);
    expect(next.values[1]).toBe(1);
    expect(next.hearts).toBe(5);
    expect(next.status).toBe('playing');
    expect(next.history.length).toBe(1);
  });

  it('costs a heart on wrong digit when mistakeCheck is true and stays flagged', () => {
    const game = makeTestGame();
    const next = placeDigit(game, 1, 9, {
      ...defaultOpts,
      mistakeCheck: true,
    });
    expect(next.values[1]).toBe(9);
    expect(next.hearts).toBe(4);
    expect(next.status).toBe('playing');
  });

  it('costs no hearts on wrong digit when mistakeCheck is false', () => {
    const game = makeTestGame();
    const next = placeDigit(game, 1, 9, {
      ...defaultOpts,
      mistakeCheck: false,
    });
    expect(next.values[1]).toBe(9);
    expect(next.hearts).toBe(5);
  });

  it('transitions to lost when hearts reach 0', () => {
    let game = makeTestGame();
    game = { ...game, hearts: 1 };
    const next = placeDigit(game, 1, 9, defaultOpts);
    expect(next.hearts).toBe(0);
    expect(next.status).toBe('lost');
  });

  it('transitions to won when all cells match solution', () => {
    let game = makeTestGame();
    // Fill all except cell 80 with 1
    const newValues = new Array(81).fill(1);
    newValues[80] = 0;
    game = { ...game, values: newValues };

    const next = placeDigit(game, 80, 1, defaultOpts);
    expect(next.status).toBe('won');
  });

  it('auto-remove clears peer notes', () => {
    let game = makeTestGame();
    // Set note 1 on cell 1 (peer of cell 2)
    game = toggleNote(game, 1, 1);
    expect(hasNote(game.notes[1], 1)).toBe(true);

    const peerOf1 = peers(1).find((c) => game.values[c] === 0)!;
    game = toggleNote(game, peerOf1, 1);
    expect(hasNote(game.notes[peerOf1], 1)).toBe(true);

    // Place digit 1 in cell 1
    const next = placeDigit(game, 1, 1, {
      ...defaultOpts,
      autoRemoveNotes: true,
    });
    expect(hasNote(next.notes[peerOf1], 1)).toBe(false);
    expect(next.history[next.history.length - 1].length).toBeGreaterThan(1);
  });

  it('locks correct non-given digit when mistakeCheck is on', () => {
    let game = makeTestGame();
    game = placeDigit(game, 1, 1, { ...defaultOpts, mistakeCheck: true });
    expect(game.values[1]).toBe(1);

    const next = placeDigit(game, 1, 2, {
      ...defaultOpts,
      mistakeCheck: true,
    });
    expect(next).toBe(game);
  });

  it('no-ops when status is not playing', () => {
    let game = makeTestGame();
    game = { ...game, status: 'lost' };
    expect(placeDigit(game, 1, 1, defaultOpts)).toBe(game);
    expect(toggleNote(game, 1, 1)).toBe(game);
    expect(erase(game, 1)).toBe(game);
  });

  it('allows notes only on empty cells', () => {
    let game = makeTestGame();
    // Given cell 0
    expect(toggleNote(game, 0, 5)).toBe(game);

    // Place digit 1 in cell 1
    game = placeDigit(game, 1, 1, defaultOpts);
    expect(toggleNote(game, 1, 5)).toBe(game);

    // Empty cell 2
    const next = toggleNote(game, 2, 5);
    expect(hasNote(next.notes[2], 5)).toBe(true);
  });

  it('placing digit clears cell own notes', () => {
    let game = makeTestGame();
    game = toggleNote(game, 1, 5);
    game = toggleNote(game, 1, 6);
    expect(game.notes[1]).toBe(toggleBit(toggleBit(0, 5), 6));

    const next = placeDigit(game, 1, 1, defaultOpts);
    expect(next.notes[1]).toBe(0);
    expect(next.values[1]).toBe(1);
  });

  it('erase clears value and notes, but is no-op on given', () => {
    let game = makeTestGame();
    // Given cell 0
    expect(erase(game, 0)).toBe(game);

    // Empty cell with nothing is no-op
    expect(erase(game, 1)).toBe(game);

    // Placed cell
    game = placeDigit(game, 1, 9, { ...defaultOpts, mistakeCheck: false });
    expect(game.values[1]).toBe(9);
    let cleared = erase(game, 1);
    expect(cleared.values[1]).toBe(0);

    // Note cell
    game = toggleNote(cleared, 1, 3);
    expect(game.notes[1]).toBe(1 << 3);
    cleared = erase(game, 1);
    expect(cleared.notes[1]).toBe(0);
  });

  it('never mutates input state (deep freeze test)', () => {
    const raw = makeTestGame();
    // Deep freeze
    Object.freeze(raw.givens);
    Object.freeze(raw.solution);
    Object.freeze(raw.values);
    Object.freeze(raw.notes);
    Object.freeze(raw.history);
    const frozen = Object.freeze(raw);

    expect(() => placeDigit(frozen, 1, 1, defaultOpts)).not.toThrow();
    expect(() => toggleNote(frozen, 1, 2)).not.toThrow();
    expect(() => erase(frozen, 1)).not.toThrow();
    expect(() => undo(frozen)).not.toThrow();
    expect(() => revealHint(frozen, 1)).not.toThrow();
    expect(() => tick(frozen, 100)).not.toThrow();
  });

  it('undo restores placed digit and cleared peer notes', () => {
    let game = makeTestGame();
    const peerOf1 = peers(1).find((c) => game.values[c] === 0)!;
    game = toggleNote(game, peerOf1, 1);
    expect(hasNote(game.notes[peerOf1], 1)).toBe(true);

    // Place digit with auto-remove
    game = placeDigit(game, 1, 1, { ...defaultOpts, autoRemoveNotes: true });
    expect(game.values[1]).toBe(1);
    expect(hasNote(game.notes[peerOf1], 1)).toBe(false);

    // Undo restores value and peer notes
    const undone = undo(game);
    expect(undone.values[1]).toBe(0);
    expect(hasNote(undone.notes[peerOf1], 1)).toBe(true);
    expect(undone.history.length).toBe(1);
  });

  it('undo does not refund hearts or hints', () => {
    let game = makeTestGame();
    // Wrong digit costs a heart
    game = placeDigit(game, 1, 9, { ...defaultOpts, mistakeCheck: true });
    expect(game.hearts).toBe(4);

    const undoneMistake = undo(game);
    expect(undoneMistake.hearts).toBe(4);

    // Hint costs a hint
    const hinted = revealHint(undoneMistake, 1);
    expect(hinted.hintsLeft).toBe(4);
    const undoneHint = undo(hinted);
    expect(undoneHint.hintsLeft).toBe(4);
    expect(undoneHint.values[1]).toBe(0);
  });

  it('undo is no-op when history is empty or not playing', () => {
    const game = makeTestGame();
    expect(undo(game)).toBe(game);

    const lost = { ...game, status: 'lost' as const };
    expect(undo(lost)).toBe(lost);
  });

  it('revealHint writes solution digit, costs 1 hint, and runs win check', () => {
    let game = makeTestGame();
    // Given cell 0 is no-op, no hint spent
    expect(revealHint(game, 0)).toBe(game);

    // Correctly already placed cell is no-op, no hint spent
    game = placeDigit(game, 1, 1, defaultOpts);
    expect(revealHint(game, 1)).toBe(game);

    // Empty cell 2 gets solution digit
    const hinted = revealHint(game, 2);
    expect(hinted.values[2]).toBe(1); // solution is all 1s
    expect(hinted.hintsLeft).toBe(4);
    expect(hinted.hearts).toBe(5);

    // Check win condition on last cell
    const nearWinValues = new Array(81).fill(1);
    nearWinValues[80] = 0;
    const nearWinGame = {
      ...game,
      values: nearWinValues,
      hintsLeft: 1,
    };
    const wonGame = revealHint(nearWinGame, 80);
    expect(wonGame.status).toBe('won');
    expect(wonGame.hintsLeft).toBe(0);
  });

  it('revealHint does nothing when hintsLeft is 0', () => {
    let game = makeTestGame();
    game = { ...game, hintsLeft: 0 };
    expect(revealHint(game, 2)).toBe(game);
  });

  it('tick increments elapsedMs only while playing', () => {
    const game = makeTestGame();
    const ticked = tick(game, 500);
    expect(ticked.elapsedMs).toBe(500);

    expect(tick(game, 0)).toBe(game);
    expect(tick(game, -10)).toBe(game);

    const pausedOrLost = { ...game, status: 'lost' as const };
    expect(tick(pausedOrLost, 500)).toBe(pausedOrLost);
  });
});

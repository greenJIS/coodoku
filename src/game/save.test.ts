import { describe, expect, it } from 'vitest';
import type { Puzzle } from '../engine';
import { createGame } from './cells';
import { placeDigit, toggleNote } from './rules';
import { parse, serialize } from './save';

// Valid 9x9 canonical solution
const VALID_SOLUTION_ARRAY: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5,
  6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5,
  6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5,
  6, 7, 8,
];

function makeValidGame() {
  const puzzle = new Uint8Array(81).fill(0);
  puzzle[0] = 1; // Cell 0 given
  const solution = Uint8Array.from(VALID_SOLUTION_ARRAY);
  const mock: Puzzle = {
    puzzle,
    solution,
    difficulty: 'easy',
    exact: true,
    seed: 42,
    rating: { hardest: 'nakedSingle', counts: {} as never },
  };
  return createGame(mock, 'happy otter');
}

describe('save serialization and parsing', () => {
  it('round-trips a fresh game', () => {
    const game = makeValidGame();
    const data = serialize(game);
    const parsed = parse(data);
    expect(parsed).toEqual(game);
  });

  it('round-trips an in-progress game with moves and notes', () => {
    let game = makeValidGame();
    // Add note
    game = toggleNote(game, 1, 3);
    // Place digit
    game = placeDigit(game, 2, 3, {
      mistakeCheck: false,
      autoRemoveNotes: false,
    });
    const data = serialize(game);
    const parsed = parse(data);
    expect(parsed).toEqual(game);
  });

  it('rejects non-objects', () => {
    expect(parse(null)).toBeNull();
    expect(parse(undefined)).toBeNull();
    expect(parse('string')).toBeNull();
    expect(parse(123)).toBeNull();
    expect(parse([])).toBeNull();
  });

  it('rejects invalid difficulty or seed or name', () => {
    const raw = serialize(makeValidGame());
    expect(parse({ ...raw, difficulty: 'impossible' })).toBeNull();
    expect(parse({ ...raw, seed: 'bad' })).toBeNull();
    expect(parse({ ...raw, seed: 1.5 })).toBeNull();
    expect(parse({ ...raw, exact: 'yes' })).toBeNull();
    expect(parse({ ...raw, name: '' })).toBeNull();
    expect(parse({ ...raw, name: '   ' })).toBeNull();
  });

  it('rejects invalid hearts, hintsLeft, elapsedMs, status', () => {
    const raw = serialize(makeValidGame());
    expect(parse({ ...raw, hearts: -1 })).toBeNull();
    expect(parse({ ...raw, hearts: 6 })).toBeNull();
    expect(parse({ ...raw, hintsLeft: -1 })).toBeNull();
    expect(parse({ ...raw, hintsLeft: 6 })).toBeNull();
    expect(parse({ ...raw, elapsedMs: -100 })).toBeNull();
    expect(parse({ ...raw, elapsedMs: NaN })).toBeNull();
    expect(parse({ ...raw, status: 'paused' })).toBeNull();
  });

  it('rejects invalid arrays length or contents', () => {
    const raw = serialize(makeValidGame());
    expect(parse({ ...raw, givens: [1, 2, 3] })).toBeNull();
    expect(parse({ ...raw, solution: new Array(82).fill(1) })).toBeNull();
    expect(parse({ ...raw, values: 'invalid' })).toBeNull();
    expect(parse({ ...raw, notes: new Array(81).fill('x') })).toBeNull();

    // Notes out of range (bit 0 set)
    const badNotes = new Array(81).fill(0);
    badNotes[0] = 1; // bit 0 set (not 1..9)
    expect(parse({ ...raw, notes: badNotes })).toBeNull();

    // Notes negative
    badNotes[0] = -2;
    expect(parse({ ...raw, notes: badNotes })).toBeNull();
  });

  it('rejects givens that disagree with solution or values', () => {
    const raw = serialize(makeValidGame());
    const badGivens = [...(raw.givens as number[])];
    badGivens[0] = 9; // Solution is 1
    expect(parse({ ...raw, givens: badGivens })).toBeNull();

    // Given disagrees with value on given cell
    const badValues = [...(raw.values as number[])];
    badValues[0] = 2; // Given is 1
    expect(parse({ ...raw, values: badValues })).toBeNull();
  });

  it('rejects invalid solution grid', () => {
    const raw = serialize(makeValidGame());
    const badSolution = [...(raw.solution as number[])];
    badSolution[1] = badSolution[0]; // duplicate in row 0
    expect(parse({ ...raw, solution: badSolution })).toBeNull();
  });

  it('rejects invalid history entries', () => {
    const raw = serialize(makeValidGame());
    expect(parse({ ...raw, history: 'none' })).toBeNull();
    expect(parse({ ...raw, history: [1] })).toBeNull();
    expect(
      parse({ ...raw, history: [[{ cell: 99, prevValue: 1, prevNotes: 0 }]] }),
    ).toBeNull();
    expect(
      parse({ ...raw, history: [[{ cell: 0, prevValue: 12, prevNotes: 0 }]] }),
    ).toBeNull();
    expect(
      parse({ ...raw, history: [[{ cell: 0, prevValue: 1, prevNotes: 1 }]] }),
    ).toBeNull();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Difficulty, GenerateRequest, Puzzle } from '../engine';
import { createGame } from '../game/cells';
import { parse } from '../game/save';
import { GAME_KEY, readKey, writeKey } from '../storage/storage';
import { engineClient, type EngineGenerator } from './engine';
import { useGameStore } from './game';
import { useSettingsStore } from './settings';
import { useStatsStore } from './stats';
import { useViewStore } from './view';

// Valid 9x9 canonical solution
const VALID_SOLUTION_ARRAY: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5,
  6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5,
  6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5,
  6, 7, 8,
];

function makeFakePuzzle(difficulty: Difficulty = 'easy'): Puzzle {
  const puzzle = new Uint8Array(81).fill(0);
  puzzle[0] = 1; // Cell 0 is given
  return {
    puzzle,
    solution: Uint8Array.from(VALID_SOLUTION_ARRAY),
    difficulty,
    exact: true,
    seed: 123,
    rating: { hardest: 'nakedSingle', counts: {} as never },
  };
}

describe('game store', () => {
  let fakeGenerator: EngineGenerator;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useSettingsStore.setState({
      name: 'Test Otter',
      difficulty: 'easy',
      mistakeCheck: true,
      autoRemoveNotes: true,
      sound: false, // mute audio in tests
      vibrate: false,
    });
    useStatsStore.setState({
      stats: {
        easy: { solved: 0, bestMs: null },
        medium: { solved: 0, bestMs: null },
        hard: { solved: 0, bestMs: null },
        expert: { solved: 0, bestMs: null },
      },
      resetArmed: false,
    });
    useGameStore.setState({
      game: null,
      selected: null,
      notesMode: false,
      paused: false,
      lastEntered: null,
      generating: false,
      error: null,
      pendingDifficulty: null,
      newBest: false,
    });
    useViewStore.setState({ view: 'loading' });

    fakeGenerator = vi.fn(async (request: GenerateRequest) => {
      return makeFakePuzzle(request.difficulty);
    });
    engineClient.setGenerator(fakeGenerator);
  });

  afterEach(() => {
    engineClient.resetGenerator();
    vi.useRealTimers();
  });

  it('starts a new game via newGame and sets store state', async () => {
    await useGameStore.getState().newGame('medium');
    const state = useGameStore.getState();

    expect(state.game).not.toBeNull();
    expect(state.game?.difficulty).toBe('medium');
    expect(state.generating).toBe(false);
    expect(state.error).toBeNull();
    expect(state.game?.status).toBe('playing');
  });

  it('handles cell selection and digit entry', async () => {
    await useGameStore.getState().newGame('easy');
    const store = useGameStore.getState();

    // Select cell 1 (empty cell, solution is 2)
    store.select(1);
    expect(useGameStore.getState().selected).toBe(1);

    // Enter correct digit 2
    store.enter(2);
    expect(useGameStore.getState().game?.values[1]).toBe(2);
    expect(useGameStore.getState().lastEntered).toBe(1);

    // Enter wrong digit at cell 2 (solution is 3)
    store.select(2);
    store.enter(9);
    expect(useGameStore.getState().game?.values[2]).toBe(9);
    expect(useGameStore.getState().game?.hearts).toBe(4);
    expect(useGameStore.getState().lastEntered).toBeNull();
  });

  it('sets a wave when a digit completes a row and clears it after 1s', async () => {
    await useGameStore.getState().newGame('easy');
    const { game } = useGameStore.getState();
    if (!game) throw new Error('no game');

    // Fill all but cell 4 of row 0 with the solution, then enter the last one
    const values = [...game.values];
    for (let c = 0; c < 9; c++) values[c] = game.solution[c];
    values[4] = 0;
    useGameStore.setState({ game: { ...game, values }, wave: null });

    useGameStore.getState().select(4);
    useGameStore.getState().enter(game.solution[4]);

    const { wave } = useGameStore.getState();
    expect(wave?.[4]).toBe(0);
    expect(wave?.[0]).toBe(4);
    expect(wave?.[8]).toBe(4);

    vi.advanceTimersByTime(1000);
    expect(useGameStore.getState().wave).toBeNull();
  });

  it('handles notes mode and erase', async () => {
    await useGameStore.getState().newGame('easy');
    const store = useGameStore.getState();

    store.select(2);
    store.toggleNotesMode();
    expect(useGameStore.getState().notesMode).toBe(true);

    // Place note
    store.enter(5);
    expect(useGameStore.getState().game?.notes[2]).toBe(1 << 5);

    // Erase note
    store.erase();
    expect(useGameStore.getState().game?.notes[2]).toBe(0);
  });

  it('handles undo action', async () => {
    await useGameStore.getState().newGame('easy');
    const store = useGameStore.getState();

    store.select(1);
    store.enter(2);
    expect(useGameStore.getState().game?.values[1]).toBe(2);

    store.undo();
    expect(useGameStore.getState().game?.values[1]).toBe(0);
  });

  it('hint targets selected cell and disables on given or correct cell', async () => {
    await useGameStore.getState().newGame('easy');
    const store = useGameStore.getState();

    // Cell 0 is given: hint is no-op
    store.select(0);
    store.hint();
    expect(useGameStore.getState().game?.hintsLeft).toBe(5);

    // Cell 1 is empty: hint places solution digit 2
    store.select(1);
    store.hint();
    expect(useGameStore.getState().game?.values[1]).toBe(2);
    expect(useGameStore.getState().game?.hintsLeft).toBe(4);

    // Hint on already correct cell 1 is no-op
    store.hint();
    expect(useGameStore.getState().game?.hintsLeft).toBe(4);
  });

  it('retry rebuilds from same puzzle and name', async () => {
    await useGameStore.getState().newGame('easy');
    const initialName = useGameStore.getState().game?.name;

    // Place digit and lose a heart
    useGameStore.getState().select(1);
    useGameStore.getState().enter(9);
    expect(useGameStore.getState().game?.hearts).toBe(4);

    useGameStore.getState().retry();
    const retried = useGameStore.getState().game;
    expect(retried?.hearts).toBe(5);
    expect(retried?.values[1]).toBe(0);
    expect(retried?.name).toBe(initialName);
  });

  it('asks to confirm every difficulty change once a game exists', async () => {
    // No game yet: requestDifficulty starts a new game immediately
    useGameStore.getState().requestDifficulty('medium');
    await vi.runAllTimersAsync();
    expect(useGameStore.getState().game?.difficulty).toBe('medium');
    expect(useGameStore.getState().pendingDifficulty).toBeNull();

    // Same difficulty: nothing happens
    useGameStore.getState().requestDifficulty('medium');
    expect(useGameStore.getState().pendingDifficulty).toBeNull();

    // Fresh board, no progress: still asks
    useGameStore.getState().requestDifficulty('hard');
    expect(useGameStore.getState().pendingDifficulty).toBe('hard');
    useGameStore.getState().cancelDifficulty();

    // With progress: sets pendingDifficulty and pauses
    useGameStore.getState().select(1);
    useGameStore.getState().enter(2);
    useGameStore.getState().requestDifficulty('expert');
    expect(useGameStore.getState().pendingDifficulty).toBe('expert');
    expect(useGameStore.getState().paused).toBe(true);

    // Cancel difficulty
    useGameStore.getState().cancelDifficulty();
    expect(useGameStore.getState().pendingDifficulty).toBeNull();
    expect(useGameStore.getState().paused).toBe(false);

    // Request again and confirm
    useGameStore.getState().requestDifficulty('expert');
    useGameStore.getState().confirmDifficulty();
    expect(useGameStore.getState().paused).toBe(false);
    await vi.runAllTimersAsync();
    expect(useGameStore.getState().game?.difficulty).toBe('expert');
    expect(useGameStore.getState().pendingDifficulty).toBeNull();
  });

  it('aborts prior newGame request when another newGame is called', async () => {
    const signals: AbortSignal[] = [];

    engineClient.setGenerator(async (request, options) => {
      const signal = options?.signal;
      if (signal) {
        signals.push(signal);
      }
      await new Promise((resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        setTimeout(() => resolve(makeFakePuzzle(request.difficulty)), 100);
      });
      return makeFakePuzzle(request.difficulty);
    });

    const promise1 = useGameStore.getState().newGame('easy');
    const promise2 = useGameStore.getState().newGame('hard');

    expect(signals[0].aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(150);
    await Promise.allSettled([promise1, promise2]);

    expect(useGameStore.getState().game?.difficulty).toBe('hard');
  });

  it('records win, updates stats, sets newBest, and removes saved game', async () => {
    await useGameStore.getState().newGame('easy');
    const game = useGameStore.getState().game!;

    // Fill all cells to win
    const nearWinValues = [...game.solution];
    nearWinValues[80] = 0;
    useGameStore.setState({
      game: {
        ...game,
        values: nearWinValues,
        elapsedMs: 45000,
      },
      selected: 80,
    });

    useGameStore.getState().enter(game.solution[80]);

    const wonGame = useGameStore.getState().game;
    expect(wonGame?.status).toBe('won');
    expect(useGameStore.getState().newBest).toBe(true);

    // Stats updated
    const stats = useStatsStore.getState().stats.easy;
    expect(stats.solved).toBe(1);
    expect(stats.bestMs).toBe(45000);

    // Saved game cleared from storage
    expect(readKey(GAME_KEY, parse)).toBeNull();
  });

  it('debounces autosave and supports flushSave', async () => {
    await useGameStore.getState().newGame('easy');
    useGameStore.getState().select(1);
    useGameStore.getState().enter(2);

    // Before 500ms debounce
    expect(readKey(GAME_KEY, parse)).toBeNull();

    // After debounce
    vi.advanceTimersByTime(550);
    const saved = readKey(GAME_KEY, parse);
    expect(saved?.values[1]).toBe(2);

    // Modify and flush immediately
    useGameStore.getState().select(2);
    useGameStore.getState().enter(3);
    useGameStore.getState().flushSave();
    const flushed = readKey(GAME_KEY, parse);
    expect(flushed?.values[2]).toBe(3);
  });

  it('boot restores a saved game paused and does not generate', async () => {
    const mockGame = createGame(makeFakePuzzle('hard'), 'Saved Otter');
    writeKey(GAME_KEY, mockGame);

    await useGameStore.getState().boot();
    expect(useGameStore.getState().game?.name).toBe('Saved Otter');
    expect(useGameStore.getState().game?.difficulty).toBe('hard');
    expect(useGameStore.getState().paused).toBe(true);
  });

  it('boot with no save leaves the game empty', async () => {
    localStorage.clear();
    useGameStore.setState({ game: null });
    await useGameStore.getState().boot();
    expect(useGameStore.getState().game).toBeNull();
  });

  it('boot ignores a won or lost save', async () => {
    const won = {
      ...createGame(makeFakePuzzle('easy'), 'Old'),
      status: 'won' as const,
    };
    writeKey(GAME_KEY, won);
    useGameStore.setState({ game: null });
    await useGameStore.getState().boot();
    expect(useGameStore.getState().game).toBeNull();
  });

  it('startGame generates, then moves to the game view', async () => {
    useViewStore.setState({ view: 'home' });
    await useGameStore.getState().startGame('medium');
    expect(useGameStore.getState().game?.difficulty).toBe('medium');
    expect(useViewStore.getState().view).toBe('game');
  });

  it('startGame stays on home and keeps the old game when generation fails', async () => {
    const saved = createGame(makeFakePuzzle('easy'), 'Keeper');
    useGameStore.setState({ game: saved });
    useViewStore.setState({ view: 'home' });
    engineClient.setGenerator(async () => {
      throw new Error('boom');
    });
    await useGameStore.getState().startGame('hard');
    expect(useViewStore.getState().view).toBe('home');
    expect(useGameStore.getState().game).toBe(saved);
    expect(useGameStore.getState().error).toBe('boom');
  });

  it('exitToHome saves, pauses and goes home', () => {
    useGameStore.setState({
      game: createGame(makeFakePuzzle('easy'), 'Away'),
      paused: false,
    });
    useViewStore.setState({ view: 'game' });
    useGameStore.getState().exitToHome();
    expect(useGameStore.getState().paused).toBe(true);
    expect(useViewStore.getState().view).toBe('home');
    expect(readKey(GAME_KEY, parse)?.name).toBe('Away');
  });
});

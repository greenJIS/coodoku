import { create } from 'zustand';
import type { Difficulty, Puzzle } from '../engine';
import { createGame } from '../game/cells';
import { completedUnitCells, completedUnits } from '../game/queries';
import {
  erase,
  placeDigit,
  revealHint,
  tick as tickRule,
  toggleNote,
  undo,
} from '../game/rules';
import { parse, serialize } from '../game/save';
import type { GameState } from '../game/types';
import { haptics } from '../lib/haptics';
import { randomName } from '../lib/names';
import { sound } from '../lib/sound';
import { GAME_KEY, readKey, removeKey, writeKey } from '../storage/storage';
import { engineClient } from './engine';
import { useSettingsStore } from './settings';
import { useStatsStore } from './stats';
import { useViewStore } from './view';

export interface GameStore {
  game: GameState | null;
  selected: number | null;
  notesMode: boolean;
  paused: boolean;
  lastEntered: number | null;
  /** Wave delay steps per cell after a row, column or box was completed. */
  wave: Readonly<Record<number, number>> | null;
  generating: boolean;
  error: string | null;
  pendingDifficulty: Difficulty | null;
  newBest: boolean;

  // Actions
  select: (cell: number | null) => void;
  enter: (digit: number) => void;
  erase: () => void;
  toggleNotesMode: () => void;
  setNotesMode: (on: boolean) => void;
  undo: () => void;
  hint: () => void;
  tick: (dtMs: number) => void;
  setPaused: (paused: boolean) => void;
  renameGame: (name: string) => void;

  newGame: (difficulty?: Difficulty) => Promise<void>;
  startGame: (difficulty: Difficulty) => Promise<void>;
  exitToHome: () => void;
  prefetch: () => Promise<void>;
  retry: () => void;
  requestDifficulty: (difficulty: Difficulty) => void;
  confirmDifficulty: () => void;
  cancelDifficulty: () => void;

  boot: () => Promise<void>;
  flushSave: () => void;
}

// In-flight controllers and prefetch cache
let currentAbortController: AbortController | null = null;
let prefetchAbortController: AbortController | null = null;
let prefetchPromise: Promise<Puzzle> | null = null;
let prefetchDifficulty: Difficulty | null = null;
let prefetchedPuzzle: { difficulty: Difficulty; puzzle: Puzzle } | null = null;

export function clearPrefetchCache(): void {
  currentAbortController?.abort();
  currentAbortController = null;
  prefetchAbortController?.abort();
  prefetchAbortController = null;
  prefetchPromise = null;
  prefetchDifficulty = null;
  prefetchedPuzzle = null;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutosave(state: GameState | null): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  if (!state || state.status !== 'playing') {
    removeKey(GAME_KEY);
    return;
  }
  saveTimer = setTimeout(() => {
    writeKey(GAME_KEY, serialize(state));
    saveTimer = null;
  }, 500);
}

function flushAutosave(state: GameState | null): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (state && state.status === 'playing') {
    writeKey(GAME_KEY, serialize(state));
  } else {
    removeKey(GAME_KEY);
  }
}

/** Distance from `cell` along each unit it just completed (later unit wins). */
function waveDelays(
  game: GameState,
  cell: number,
): Record<number, number> | null {
  const units = completedUnitCells(game, cell);
  if (units.length === 0) return null;

  const delays: Record<number, number> = {};
  for (const unit of units) {
    const start = Math.max(0, unit.indexOf(cell));
    unit.forEach((idx, n) => {
      delays[idx] = Math.abs(n - start);
    });
  }
  return delays;
}

function clearWaveLater(wave: Readonly<Record<number, number>>): void {
  setTimeout(() => {
    if (useGameStore.getState().wave === wave) {
      useGameStore.setState({ wave: null });
    }
  }, 1000);
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  selected: null,
  notesMode: false,
  paused: false,
  lastEntered: null,
  wave: null,
  generating: false,
  error: null,
  pendingDifficulty: null,
  newBest: false,

  select: (cell) => {
    const current = get().selected;
    if (cell !== current) {
      set({ selected: cell, lastEntered: null });
    }
  },

  setNotesMode: (notesMode) => {
    set({ notesMode });
  },

  toggleNotesMode: () => {
    set((s) => ({ notesMode: !s.notesMode }));
  },

  setPaused: (paused) => {
    set({ paused });
  },

  renameGame: (name) => {
    const { game } = get();
    useSettingsStore.getState().setName(name);
    if (!game) return;
    const nextGame = { ...game, name };
    set({ game: nextGame });
    scheduleAutosave(nextGame);
  },

  enter: (digit) => {
    const { game, selected, notesMode } = get();
    if (selected === null || !game || game.status !== 'playing') return;

    const settings = useSettingsStore.getState();
    const soundOpts = { sound: settings.sound, volume: settings.volume };

    if (notesMode) {
      const prevNotes = game.notes[selected];
      const nextGame = toggleNote(game, selected, digit);
      if (nextGame.notes[selected] !== prevNotes) {
        sound.play('note', soundOpts);
        haptics.tap('note', settings.vibrate);
        scheduleAutosave(nextGame);
        set({ game: nextGame });
      }
      return;
    }

    const prevHearts = game.hearts;
    const opts = {
      mistakeCheck: settings.mistakeCheck,
      autoRemoveNotes: settings.autoRemoveNotes,
    };

    const nextGame = placeDigit(game, selected, digit, opts);
    if (nextGame === game) return; // locked / no-op

    // Check mistake
    if (nextGame.hearts < prevHearts) {
      sound.play('mistake', soundOpts);
      haptics.tap('mistake', settings.vibrate);

      if (nextGame.status === 'lost') {
        flushAutosave(null);
        sound.play('lose', soundOpts);
        haptics.tap('lose', settings.vibrate);
      } else {
        scheduleAutosave(nextGame);
      }

      set({ game: nextGame, lastEntered: null });
      return;
    }

    // Correct placement or non-flagged placement
    const isCorrect = digit === nextGame.solution[selected];
    const newLastEntered = isCorrect ? selected : null;
    const wave = isCorrect ? waveDelays(nextGame, selected) : null;

    if (isCorrect) {
      const completed = completedUnits(nextGame, selected);
      if (completed.row || completed.col || completed.box) {
        sound.play('complete', soundOpts);
        haptics.tap('tap', settings.vibrate);
      } else {
        sound.play('place', soundOpts);
        haptics.tap('place', settings.vibrate);
      }
    } else {
      sound.play('place', soundOpts);
      haptics.tap('place', settings.vibrate);
    }

    if (nextGame.status === 'won') {
      const stats = useStatsStore.getState().stats[nextGame.difficulty];
      const isNewBest =
        stats.bestMs === null || nextGame.elapsedMs < stats.bestMs;

      useStatsStore
        .getState()
        .recordWin(nextGame.difficulty, nextGame.elapsedMs);
      flushAutosave(null);

      sound.play('win', soundOpts);
      haptics.tap('win', settings.vibrate);

      set({
        game: nextGame,
        lastEntered: newLastEntered,
        wave,
        newBest: isNewBest,
      });
      if (wave) clearWaveLater(wave);

      void get().prefetch();
      return;
    }

    scheduleAutosave(nextGame);
    set({ game: nextGame, lastEntered: newLastEntered, wave });
    if (wave) clearWaveLater(wave);
  },

  erase: () => {
    const { game, selected } = get();
    if (selected === null || !game || game.status !== 'playing') return;

    const nextGame = erase(game, selected);
    if (nextGame === game) return;

    const settings = useSettingsStore.getState();
    sound.play('erase', { sound: settings.sound, volume: settings.volume });
    haptics.tap('erase', settings.vibrate);

    scheduleAutosave(nextGame);
    set({ game: nextGame, lastEntered: null });
  },

  undo: () => {
    const { game } = get();
    if (!game || game.status !== 'playing' || game.history.length === 0) return;

    const nextGame = undo(game);
    const settings = useSettingsStore.getState();
    sound.play('place', { sound: settings.sound, volume: settings.volume });
    haptics.tap('tap', settings.vibrate);

    scheduleAutosave(nextGame);
    set({ game: nextGame, lastEntered: null });
  },

  hint: () => {
    const { game, selected } = get();
    if (
      selected === null ||
      !game ||
      game.status !== 'playing' ||
      game.hintsLeft <= 0 ||
      game.givens[selected] !== 0 ||
      game.values[selected] === game.solution[selected]
    ) {
      return;
    }

    const nextGame = revealHint(game, selected);
    if (nextGame === game) return;

    const settings = useSettingsStore.getState();
    const soundOpts = { sound: settings.sound, volume: settings.volume };
    sound.play('hint', soundOpts);
    haptics.tap('tap', settings.vibrate);

    if (nextGame.status === 'won') {
      const stats = useStatsStore.getState().stats[nextGame.difficulty];
      const isNewBest =
        stats.bestMs === null || nextGame.elapsedMs < stats.bestMs;

      useStatsStore
        .getState()
        .recordWin(nextGame.difficulty, nextGame.elapsedMs);
      flushAutosave(null);

      sound.play('win', soundOpts);
      haptics.tap('win', settings.vibrate);

      set({
        game: nextGame,
        lastEntered: selected,
        newBest: isNewBest,
      });

      void get().prefetch();
      return;
    }

    scheduleAutosave(nextGame);
    set({ game: nextGame, lastEntered: selected });
  },

  tick: (dtMs) => {
    const { game, paused } = get();
    if (paused || !game || game.status !== 'playing') return;
    set({ game: tickRule(game, dtMs) });
  },

  newGame: async (requestedDifficulty) => {
    const targetDiff =
      requestedDifficulty ?? useSettingsStore.getState().difficulty;

    // Check ready prefetch
    if (prefetchedPuzzle && prefetchedPuzzle.difficulty === targetDiff) {
      const puzzle = prefetchedPuzzle.puzzle;
      prefetchedPuzzle = null;
      const game = createGame(puzzle, randomName());
      useSettingsStore.getState().setDifficulty(game.difficulty);

      set({
        game,
        selected: null,
        notesMode: false,
        paused: false,
        lastEntered: null,
        generating: false,
        error: null,
        pendingDifficulty: null,
        newBest: false,
      });

      scheduleAutosave(game);
      void get().prefetch();
      return;
    }

    // Check matching in-flight prefetch
    if (prefetchPromise && prefetchDifficulty === targetDiff) {
      set({ generating: true, error: null });
      try {
        const puzzle = await prefetchPromise;
        prefetchPromise = null;
        prefetchDifficulty = null;
        prefetchAbortController = null;

        const game = createGame(puzzle, randomName());
        useSettingsStore.getState().setDifficulty(game.difficulty);

        set({
          game,
          selected: null,
          notesMode: false,
          paused: false,
          lastEntered: null,
          generating: false,
          error: null,
          pendingDifficulty: null,
          newBest: false,
        });

        scheduleAutosave(game);
        void get().prefetch();
        return;
      } catch {
        // If prefetch failed, fall through to fresh generate
      }
    }

    // Abort mismatched prefetch
    if (prefetchAbortController) {
      prefetchAbortController.abort();
      prefetchAbortController = null;
      prefetchPromise = null;
      prefetchDifficulty = null;
      prefetchedPuzzle = null;
    }

    // Abort prior newGame in flight
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }

    const controller = new AbortController();
    currentAbortController = controller;
    set({ generating: true, error: null });

    try {
      const puzzle = await engineClient.generate(
        { difficulty: targetDiff },
        { signal: controller.signal },
      );

      if (currentAbortController !== controller) {
        return; // aborted by newer request
      }
      currentAbortController = null;

      const game = createGame(puzzle, randomName());
      useSettingsStore.getState().setDifficulty(game.difficulty);

      set({
        game,
        selected: null,
        notesMode: false,
        paused: false,
        lastEntered: null,
        generating: false,
        error: null,
        pendingDifficulty: null,
        newBest: false,
      });

      scheduleAutosave(game);
      void get().prefetch();
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      if (currentAbortController === controller) {
        currentAbortController = null;
        set({
          generating: false,
          error: (err as Error).message || 'Generation failed',
        });
      }
    }
  },

  startGame: async (difficulty) => {
    const before = get().game;
    await get().newGame(difficulty);
    const { game, error } = get();
    if (error === null && game !== before) {
      useViewStore.getState().goGame();
    }
  },

  exitToHome: () => {
    get().flushSave();
    set({ paused: true });
    useViewStore.getState().goHome();
  },

  prefetch: async () => {
    const targetDiff = useSettingsStore.getState().difficulty;

    if (prefetchedPuzzle && prefetchedPuzzle.difficulty === targetDiff) {
      return;
    }
    if (prefetchPromise && prefetchDifficulty === targetDiff) {
      return;
    }

    if (prefetchAbortController) {
      prefetchAbortController.abort();
    }

    const controller = new AbortController();
    prefetchAbortController = controller;
    prefetchDifficulty = targetDiff;

    const promise = engineClient.generate(
      { difficulty: targetDiff },
      { signal: controller.signal },
    );
    prefetchPromise = promise;

    try {
      const puzzle = await promise;
      if (prefetchAbortController === controller) {
        prefetchedPuzzle = { difficulty: targetDiff, puzzle };
        prefetchPromise = null;
        prefetchDifficulty = null;
        prefetchAbortController = null;
      }
    } catch {
      if (prefetchAbortController === controller) {
        prefetchPromise = null;
        prefetchDifficulty = null;
        prefetchAbortController = null;
      }
    }
  },

  retry: () => {
    const { game } = get();
    if (!game) return;

    const freshGame: GameState = {
      ...game,
      values: [...game.givens],
      notes: new Array(81).fill(0),
      hearts: 5,
      hintsLeft: 5,
      elapsedMs: 0,
      status: 'playing',
      history: [],
    };

    set({
      game: freshGame,
      selected: null,
      notesMode: false,
      lastEntered: null,
      paused: false,
      error: null,
      newBest: false,
    });

    scheduleAutosave(freshGame);
  },

  requestDifficulty: (difficulty) => {
    const currentDiff = useSettingsStore.getState().difficulty;
    if (difficulty === currentDiff) return;

    const { game } = get();
    if (!game) {
      void get().newGame(difficulty);
      return;
    }

    set({ pendingDifficulty: difficulty, paused: true });
  },

  confirmDifficulty: () => {
    const pending = get().pendingDifficulty;
    if (pending) {
      // Unpause in the same batch that closes the confirm and Settings modals,
      // otherwise the Pause modal flashes while the new puzzle generates.
      set({ pendingDifficulty: null, paused: false });
      void get().newGame(pending);
    }
  },

  cancelDifficulty: () => {
    set({ pendingDifficulty: null, paused: false });
  },

  boot: async () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.hidden) get().flushSave();
      });
      window.addEventListener('pagehide', () => {
        get().flushSave();
      });
    }

    const saved = readKey(GAME_KEY, parse);
    if (saved && saved.status === 'playing') {
      set({
        game: saved,
        paused: true,
        selected: null,
        notesMode: false,
        generating: false,
        lastEntered: null,
        error: null,
        pendingDifficulty: null,
        newBest: false,
      });
      return;
    }

    void get().prefetch();
  },

  flushSave: () => {
    flushAutosave(get().game);
  },
}));

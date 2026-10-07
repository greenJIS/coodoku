import { DIFFICULTIES } from '../engine';
import type { Difficulty } from '../engine';

export type Theme = 'light' | 'dark';
export type DigitSize = 'normal' | 'large';

export interface Settings {
  name: string;
  difficulty: Difficulty;
  mistakeCheck: boolean;
  autoRemoveNotes: boolean;
  highlightPeers: boolean;
  highlightSame: boolean;
  showRemaining: boolean;
  showTimer: boolean;
  sound: boolean;
  volume: number;
  vibrate: boolean;
  reduceMotion: boolean;
  theme: Theme;
  digitSize: DigitSize;
  leftHanded: boolean;
}

export interface DifficultyStats {
  solved: number;
  bestMs: number | null;
}

export type Stats = Record<Difficulty, DifficultyStats>;

export function getDefaultSettings(): Settings {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const prefersReduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return {
    name: 'Calm Otter',
    difficulty: 'easy',
    mistakeCheck: true,
    autoRemoveNotes: true,
    highlightPeers: true,
    highlightSame: true,
    showRemaining: true,
    showTimer: true,
    sound: true,
    volume: 60,
    vibrate: true,
    reduceMotion: Boolean(prefersReduceMotion),
    theme: prefersDark ? 'dark' : 'light',
    digitSize: 'normal',
    leftHanded: false,
  };
}

export function getDefaultStats(): Stats {
  return {
    easy: { solved: 0, bestMs: null },
    medium: { solved: 0, bestMs: null },
    hard: { solved: 0, bestMs: null },
    expert: { solved: 0, bestMs: null },
  };
}

export function parseSettings(raw: unknown): Settings {
  const defaults = getDefaultSettings();
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return defaults;
  }

  const obj = raw as Record<string, unknown>;

  const name =
    typeof obj.name === 'string' && obj.name.trim().length > 0
      ? obj.name.trim()
      : defaults.name;

  const difficulty =
    typeof obj.difficulty === 'string' &&
    DIFFICULTIES.includes(obj.difficulty as Difficulty)
      ? (obj.difficulty as Difficulty)
      : defaults.difficulty;

  const mistakeCheck =
    typeof obj.mistakeCheck === 'boolean'
      ? obj.mistakeCheck
      : defaults.mistakeCheck;

  const autoRemoveNotes =
    typeof obj.autoRemoveNotes === 'boolean'
      ? obj.autoRemoveNotes
      : defaults.autoRemoveNotes;

  const highlightPeers =
    typeof obj.highlightPeers === 'boolean'
      ? obj.highlightPeers
      : defaults.highlightPeers;

  const highlightSame =
    typeof obj.highlightSame === 'boolean'
      ? obj.highlightSame
      : defaults.highlightSame;

  const showRemaining =
    typeof obj.showRemaining === 'boolean'
      ? obj.showRemaining
      : defaults.showRemaining;

  const showTimer =
    typeof obj.showTimer === 'boolean' ? obj.showTimer : defaults.showTimer;

  const sound = typeof obj.sound === 'boolean' ? obj.sound : defaults.sound;

  const volume =
    typeof obj.volume === 'number' &&
    !Number.isNaN(obj.volume) &&
    obj.volume >= 0 &&
    obj.volume <= 100
      ? Math.round(obj.volume)
      : defaults.volume;

  const vibrate =
    typeof obj.vibrate === 'boolean' ? obj.vibrate : defaults.vibrate;

  const reduceMotion =
    typeof obj.reduceMotion === 'boolean'
      ? obj.reduceMotion
      : defaults.reduceMotion;

  const theme: Theme =
    obj.theme === 'light' || obj.theme === 'dark' ? obj.theme : defaults.theme;

  const digitSize: DigitSize =
    obj.digitSize === 'normal' || obj.digitSize === 'large'
      ? obj.digitSize
      : defaults.digitSize;

  const leftHanded =
    typeof obj.leftHanded === 'boolean' ? obj.leftHanded : defaults.leftHanded;

  return {
    name,
    difficulty,
    mistakeCheck,
    autoRemoveNotes,
    highlightPeers,
    highlightSame,
    showRemaining,
    showTimer,
    sound,
    volume,
    vibrate,
    reduceMotion,
    theme,
    digitSize,
    leftHanded,
  };
}

export function parseStats(raw: unknown): Stats {
  const defaults = getDefaultStats();
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return defaults;
  }

  const obj = raw as Record<string, unknown>;
  const result: Partial<Stats> = {};

  for (const diff of DIFFICULTIES) {
    const current = obj[diff];
    if (
      typeof current === 'object' &&
      current !== null &&
      !Array.isArray(current)
    ) {
      const c = current as Record<string, unknown>;
      const solved =
        typeof c.solved === 'number' &&
        Number.isInteger(c.solved) &&
        c.solved >= 0
          ? c.solved
          : defaults[diff].solved;

      const bestMs =
        c.bestMs === null ||
        (typeof c.bestMs === 'number' &&
          Number.isInteger(c.bestMs) &&
          c.bestMs > 0)
          ? c.bestMs
          : defaults[diff].bestMs;

      result[diff] = { solved, bestMs };
    } else {
      result[diff] = defaults[diff];
    }
  }

  return result as Stats;
}

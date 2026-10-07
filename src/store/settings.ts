import { create } from 'zustand';
import {
  type DigitSize,
  type Settings,
  type Theme,
  getDefaultSettings,
  parseSettings,
} from '../storage/schema';
import { SETTINGS_KEY, readKey, writeKey } from '../storage/storage';

export interface SettingsStore extends Settings {
  setName: (name: string) => void;
  setDifficulty: (difficulty: Settings['difficulty']) => void;
  setMistakeCheck: (val: boolean) => void;
  setAutoRemoveNotes: (val: boolean) => void;
  setHighlightPeers: (val: boolean) => void;
  setHighlightSame: (val: boolean) => void;
  setShowRemaining: (val: boolean) => void;
  setShowTimer: (val: boolean) => void;
  setSound: (val: boolean) => void;
  setVolume: (val: number) => void;
  setVibrate: (val: boolean) => void;
  setReduceMotion: (val: boolean) => void;
  setTheme: (theme: Theme) => void;
  setDigitSize: (digitSize: DigitSize) => void;
  setLeftHanded: (val: boolean) => void;
  updateSettings: (partial: Partial<Settings>) => void;
}

function loadInitialSettings(): Settings {
  return readKey(SETTINGS_KEY, parseSettings) ?? getDefaultSettings();
}

function persist(settings: Settings): void {
  writeKey(SETTINGS_KEY, settings);
}

function toSettings(store: SettingsStore): Settings {
  return {
    name: store.name,
    difficulty: store.difficulty,
    mistakeCheck: store.mistakeCheck,
    autoRemoveNotes: store.autoRemoveNotes,
    highlightPeers: store.highlightPeers,
    highlightSame: store.highlightSame,
    showRemaining: store.showRemaining,
    showTimer: store.showTimer,
    sound: store.sound,
    volume: store.volume,
    vibrate: store.vibrate,
    reduceMotion: store.reduceMotion,
    theme: store.theme,
    digitSize: store.digitSize,
    leftHanded: store.leftHanded,
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadInitialSettings(),

  setName: (name) => {
    set({ name });
    persist(toSettings(get()));
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
    persist(toSettings(get()));
  },

  setMistakeCheck: (mistakeCheck) => {
    set({ mistakeCheck });
    persist(toSettings(get()));
  },

  setAutoRemoveNotes: (autoRemoveNotes) => {
    set({ autoRemoveNotes });
    persist(toSettings(get()));
  },

  setHighlightPeers: (highlightPeers) => {
    set({ highlightPeers });
    persist(toSettings(get()));
  },

  setHighlightSame: (highlightSame) => {
    set({ highlightSame });
    persist(toSettings(get()));
  },

  setShowRemaining: (showRemaining) => {
    set({ showRemaining });
    persist(toSettings(get()));
  },

  setShowTimer: (showTimer) => {
    set({ showTimer });
    persist(toSettings(get()));
  },

  setSound: (sound) => {
    set({ sound });
    persist(toSettings(get()));
  },

  setVolume: (volume) => {
    set({ volume });
    persist(toSettings(get()));
  },

  setVibrate: (vibrate) => {
    set({ vibrate });
    persist(toSettings(get()));
  },

  setReduceMotion: (reduceMotion) => {
    set({ reduceMotion });
    persist(toSettings(get()));
  },

  setTheme: (theme) => {
    set({ theme });
    persist(toSettings(get()));
  },

  setDigitSize: (digitSize) => {
    set({ digitSize });
    persist(toSettings(get()));
  },

  setLeftHanded: (leftHanded) => {
    set({ leftHanded });
    persist(toSettings(get()));
  },

  updateSettings: (partial) => {
    set(partial);
    persist(toSettings(get()));
  },
}));

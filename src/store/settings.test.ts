import { beforeEach, describe, expect, it } from 'vitest';
import { getDefaultSettings, parseSettings } from '../storage/schema';
import { SETTINGS_KEY, readKey } from '../storage/storage';
import { useSettingsStore } from './settings';

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState(getDefaultSettings());
  });

  it('initializes with defaults and persists modifications', () => {
    const store = useSettingsStore.getState();
    expect(store.name).toBe('Calm Otter');
    expect(store.volume).toBe(60);

    store.setVolume(85);
    expect(useSettingsStore.getState().volume).toBe(85);

    // Verify localStorage persistence
    const saved = readKey(SETTINGS_KEY, parseSettings);
    expect(saved?.volume).toBe(85);
  });

  it('updates all individual settings and persists them', () => {
    const store = useSettingsStore.getState();

    store.setName('Swift Panda');
    store.setDifficulty('expert');
    store.setMistakeCheck(false);
    store.setAutoRemoveNotes(false);
    store.setHighlightPeers(false);
    store.setHighlightSame(false);
    store.setShowRemaining(false);
    store.setShowTimer(false);
    store.setSound(false);
    store.setVibrate(false);
    store.setReduceMotion(true);
    store.setTheme('dark');
    store.setDigitSize('large');
    store.setLeftHanded(true);

    const updated = useSettingsStore.getState();
    expect(updated.name).toBe('Swift Panda');
    expect(updated.difficulty).toBe('expert');
    expect(updated.mistakeCheck).toBe(false);
    expect(updated.autoRemoveNotes).toBe(false);
    expect(updated.highlightPeers).toBe(false);
    expect(updated.highlightSame).toBe(false);
    expect(updated.showRemaining).toBe(false);
    expect(updated.showTimer).toBe(false);
    expect(updated.sound).toBe(false);
    expect(updated.vibrate).toBe(false);
    expect(updated.reduceMotion).toBe(true);
    expect(updated.theme).toBe('dark');
    expect(updated.digitSize).toBe('large');
    expect(updated.leftHanded).toBe(true);

    const saved = readKey(SETTINGS_KEY, parseSettings);
    expect(saved).toEqual({
      name: 'Swift Panda',
      difficulty: 'expert',
      mistakeCheck: false,
      autoRemoveNotes: false,
      highlightPeers: false,
      highlightSame: false,
      showRemaining: false,
      showTimer: false,
      sound: false,
      volume: 60,
      vibrate: false,
      reduceMotion: true,
      theme: 'dark',
      digitSize: 'large',
      leftHanded: true,
    });
  });
});

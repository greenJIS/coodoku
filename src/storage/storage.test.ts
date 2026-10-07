import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDefaultSettings,
  getDefaultStats,
  parseSettings,
  parseStats,
} from './schema';
import {
  GAME_KEY,
  SETTINGS_KEY,
  STATS_KEY,
  readKey,
  removeKey,
  writeKey,
} from './storage';

describe('storage helpers and schema', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports expected storage keys', () => {
    expect(SETTINGS_KEY).toBe('coodoku:settings:v1');
    expect(STATS_KEY).toBe('coodoku:stats:v1');
    expect(GAME_KEY).toBe('coodoku:game:v1');
  });

  it('writes and reads data wrapped in envelope { v: 1, data }', () => {
    const testData = { hello: 'world' };
    writeKey('test-key', testData);

    const storedRaw = localStorage.getItem('test-key');
    expect(storedRaw).toBe(JSON.stringify({ v: 1, data: testData }));

    const readBack = readKey('test-key', (data) => data as typeof testData);
    expect(readBack).toEqual(testData);
  });

  it('never throws when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('StorageDisabled');
    });

    expect(() => writeKey('key', { a: 1 })).not.toThrow();
    expect(() => readKey('key', () => null)).not.toThrow();
    expect(readKey('key', () => null)).toBeNull();
    expect(() => removeKey('key')).not.toThrow();
  });

  it('returns null on bad JSON, wrong v, or failing validator', () => {
    // Bad JSON
    localStorage.setItem('bad-json', '{ invalid json ');
    expect(readKey('bad-json', (x) => x)).toBeNull();

    // Wrong version
    localStorage.setItem('wrong-v', JSON.stringify({ v: 2, data: 123 }));
    expect(readKey('wrong-v', (x) => x)).toBeNull();

    // Missing data or v
    localStorage.setItem('missing-fields', JSON.stringify({ notV: 1 }));
    expect(readKey('missing-fields', (x) => x)).toBeNull();

    // Failing validator
    localStorage.setItem('valid-envelope', JSON.stringify({ v: 1, data: 123 }));
    expect(readKey('valid-envelope', () => null)).toBeNull();
  });

  it('removeKey removes key without throwing', () => {
    writeKey('to-remove', { num: 42 });
    expect(readKey('to-remove', (x) => x)).toEqual({ num: 42 });

    removeKey('to-remove');
    expect(readKey('to-remove', (x) => x)).toBeNull();
  });

  it('parseSettings merges defaults field by field', () => {
    const defaults = getDefaultSettings();
    expect(parseSettings(null)).toEqual(defaults);
    expect(parseSettings({})).toEqual(defaults);

    // Partial update: only volume and sound
    const partial = { volume: 80, sound: false };
    const merged = parseSettings(partial);
    expect(merged.volume).toBe(80);
    expect(merged.sound).toBe(false);
    expect(merged.difficulty).toBe(defaults.difficulty);
    expect(merged.theme).toBe(defaults.theme);
    expect(merged.mistakeCheck).toBe(defaults.mistakeCheck);

    // Invalid fields fall back to default
    const invalid = { volume: -50, difficulty: 'impossible', theme: 'neon' };
    const fallback = parseSettings(invalid);
    expect(fallback.volume).toBe(defaults.volume);
    expect(fallback.difficulty).toBe(defaults.difficulty);
    expect(fallback.theme).toBe(defaults.theme);
  });

  it('parseStats merges defaults per difficulty', () => {
    const defaults = getDefaultStats();
    expect(parseStats(null)).toEqual(defaults);
    expect(parseStats({})).toEqual(defaults);

    const partial = {
      easy: { solved: 5, bestMs: 12000 },
    };
    const merged = parseStats(partial);
    expect(merged.easy).toEqual({ solved: 5, bestMs: 12000 });
    expect(merged.hard).toEqual(defaults.hard);

    // Invalid values fallback
    const invalid = {
      easy: { solved: -2, bestMs: -100 },
    };
    const fallback = parseStats(invalid);
    expect(fallback.easy).toEqual({ solved: 0, bestMs: null });
  });
});

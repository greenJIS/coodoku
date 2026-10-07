import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { haptics } from './haptics';

describe('haptics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no-ops when enabled is false', () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      configurable: true,
      writable: true,
    });

    haptics.tap('place', false);
    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it('calls navigator.vibrate when enabled and available', () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      configurable: true,
      writable: true,
    });

    haptics.tap('place', true);
    expect(vibrateSpy).toHaveBeenCalledWith(10);

    haptics.tap('mistake', true);
    expect(vibrateSpy).toHaveBeenCalledWith([30, 40, 30]);

    haptics.tap('win', true);
    expect(vibrateSpy).toHaveBeenCalledWith([40, 60, 40, 60, 80]);
  });

  it('safely handles missing navigator.vibrate without throwing', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => haptics.tap('place', true)).not.toThrow();
  });

  it('catches and suppresses vibration errors', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: () => {
        throw new Error('NotAllowedError');
      },
      configurable: true,
      writable: true,
    });

    expect(() => haptics.tap('place', true)).not.toThrow();
  });
});

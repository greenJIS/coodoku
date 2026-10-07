import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../store/game';
import { useGameTimer } from './useGameTimer';

describe('useGameTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({
      game: { status: 'playing', elapsedMs: 0 } as never,
      paused: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks elapsed time every 250ms when playing and unpaused', () => {
    const tickSpy = vi.fn();
    useGameStore.setState({ tick: tickSpy });

    renderHook(() => useGameTimer());

    vi.advanceTimersByTime(500);
    expect(tickSpy).toHaveBeenCalled();
  });

  it('skips tick when paused or tab is hidden', () => {
    const tickSpy = vi.fn();
    useGameStore.setState({ tick: tickSpy, paused: true });

    renderHook(() => useGameTimer());

    vi.advanceTimersByTime(500);
    expect(tickSpy).not.toHaveBeenCalled();

    // Test document.hidden
    useGameStore.setState({ paused: false });
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    });

    vi.advanceTimersByTime(500);
    expect(tickSpy).not.toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    });
  });
});

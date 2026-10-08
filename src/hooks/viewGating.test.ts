import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGame } from '../game/cells';
import { useGameStore } from '../store/game';
import { useViewStore } from '../store/view';
import { makePuzzle } from '../test/fixtures';
import { useGameTimer } from './useGameTimer';
import { useKeyboard } from './useKeyboard';

describe('view gating', () => {
  const originalEnter = useGameStore.getState().enter;
  const originalTick = useGameStore.getState().tick;

  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({
      game: createGame(makePuzzle(), 'Gate'),
      paused: false,
    });
  });

  afterEach(() => {
    useGameStore.setState({ enter: originalEnter, tick: originalTick });
    vi.useRealTimers();
  });

  it('ignores game shortcuts unless the game view is showing', () => {
    const enter = vi.fn();
    useGameStore.setState({ enter });
    renderHook(() => useKeyboard());

    useViewStore.setState({ view: 'home' });
    fireEvent.keyDown(window, { key: '5' });
    expect(enter).not.toHaveBeenCalled();

    useViewStore.setState({ view: 'game' });
    fireEvent.keyDown(window, { key: '5' });
    expect(enter).toHaveBeenCalledWith(5);
  });

  it('does not tick the clock on home', () => {
    const tick = vi.fn();
    useGameStore.setState({ tick });
    renderHook(() => useGameTimer());

    useViewStore.setState({ view: 'home' });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(tick).not.toHaveBeenCalled();

    useViewStore.setState({ view: 'game' });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(tick).toHaveBeenCalled();
  });
});

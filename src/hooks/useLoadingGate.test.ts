import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGame } from '../game/cells';
import { loadUiFont } from '../lib/fonts';
import { useGameStore } from '../store/game';
import { makePuzzle } from '../test/fixtures';
import { useViewStore } from '../store/view';
import { useLoadingGate } from './useLoadingGate';

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useLoadingGate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({ generating: false, game: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows at launch, holds 600ms, fades 240ms, then unmounts', () => {
    useViewStore.setState({ view: 'loading' });
    const { result } = renderHook(() => useLoadingGate());
    expect(result.current).toEqual({ show: true, leaving: false });

    act(() => useViewStore.getState().goHome());
    advance(599);
    expect(result.current).toEqual({ show: true, leaving: false });
    advance(1);
    expect(result.current).toEqual({ show: true, leaving: true });
    advance(240);
    expect(result.current.show).toBe(false);
  });

  it('never shows when generation finishes within 150ms', () => {
    useViewStore.setState({ view: 'game' });
    const { result } = renderHook(() => useLoadingGate());
    act(() => useGameStore.setState({ generating: true }));
    advance(100);
    act(() => useGameStore.setState({ generating: false }));
    advance(1000);
    expect(result.current.show).toBe(false);
  });

  it('shows after 150ms of generation and holds at least 600ms', () => {
    useViewStore.setState({ view: 'game' });
    const { result } = renderHook(() => useLoadingGate());
    act(() => useGameStore.setState({ generating: true }));
    advance(150);
    expect(result.current.show).toBe(true);

    advance(50);
    act(() => useGameStore.setState({ generating: false }));
    advance(549);
    expect(result.current).toEqual({ show: true, leaving: false });
    advance(1);
    expect(result.current.leaving).toBe(true);
    advance(240);
    expect(result.current.show).toBe(false);
  });

  it('stays hidden while a game in progress is on screen', () => {
    useViewStore.setState({ view: 'game' });
    useGameStore.setState({ game: createGame(makePuzzle(), 'Otter') });
    const { result } = renderHook(() => useLoadingGate());
    act(() => useGameStore.setState({ generating: true }));
    advance(2000);
    expect(result.current.show).toBe(false);
  });

  it('cancels the fade if generation starts again', () => {
    useViewStore.setState({ view: 'game' });
    const { result } = renderHook(() => useLoadingGate());
    act(() => useGameStore.setState({ generating: true }));
    advance(150);
    advance(1000);
    act(() => useGameStore.setState({ generating: false }));
    advance(1);
    expect(result.current.leaving).toBe(true);
    act(() => useGameStore.setState({ generating: true }));
    advance(1);
    expect(result.current).toEqual({ show: true, leaving: false });
  });
});

describe('loadUiFont', () => {
  const originalFonts = document.fonts;

  afterEach(() => {
    if (originalFonts !== undefined) {
      Object.defineProperty(document, 'fonts', {
        value: originalFonts,
        configurable: true,
        writable: true,
      });
    } else {
      // @ts-expect-error restore missing fonts
      delete document.fonts;
    }
  });

  it('resolves immediately when document.fonts is missing', async () => {
    // @ts-expect-error simulate environment without FontFaceSet
    delete document.fonts;
    await expect(loadUiFont()).resolves.toBeUndefined();
  });

  it('calls document.fonts.load and resolves', async () => {
    const loadMock = vi.fn().mockResolvedValue([]);
    Object.defineProperty(document, 'fonts', {
      value: { load: loadMock },
      configurable: true,
      writable: true,
    });
    await expect(loadUiFont()).resolves.toEqual([]);
    expect(loadMock).toHaveBeenCalledWith('1em "Patrick Hand"');
  });

  it('never rejects even if document.fonts.load rejects', async () => {
    const loadMock = vi.fn().mockRejectedValue(new Error('Font failed'));
    Object.defineProperty(document, 'fonts', {
      value: { load: loadMock },
      configurable: true,
      writable: true,
    });
    await expect(loadUiFont()).resolves.toBeUndefined();
  });
});

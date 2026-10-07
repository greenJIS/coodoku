import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { modalStack } from './modalStack';
import { useKeyboard } from './useKeyboard';

describe('useKeyboard', () => {
  beforeEach(() => {
    modalStack.clear();
    useSettingsStore.setState({ showTimer: true });
    useGameStore.setState({
      game: { status: 'playing' } as never,
      selected: 0,
      paused: false,
    });
  });

  afterEach(() => {
    modalStack.clear();
    vi.restoreAllMocks();
  });

  it('enters digits 1-9 on number key press', () => {
    const enterSpy = vi.fn();
    useGameStore.setState({ enter: enterSpy });

    renderHook(() => useKeyboard());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    expect(enterSpy).toHaveBeenCalledWith(5);
  });

  it('erases on Backspace or Delete', () => {
    const eraseSpy = vi.fn();
    useGameStore.setState({ erase: eraseSpy });

    renderHook(() => useKeyboard());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(eraseSpy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(eraseSpy).toHaveBeenCalledTimes(2);
  });

  it('toggles notes on N key', () => {
    const toggleNotesSpy = vi.fn();
    useGameStore.setState({ toggleNotesMode: toggleNotesSpy });

    renderHook(() => useKeyboard());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    expect(toggleNotesSpy).toHaveBeenCalledTimes(1);
  });

  it('handles pause on P only when showTimer is true', () => {
    const setPausedSpy = vi.fn();
    useGameStore.setState({ setPaused: setPausedSpy, paused: false });

    renderHook(() => useKeyboard());

    // showTimer is true -> pauses
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    expect(setPausedSpy).toHaveBeenCalledWith(true);

    // showTimer is false -> ignored
    setPausedSpy.mockClear();
    useSettingsStore.setState({ showTimer: false });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    expect(setPausedSpy).not.toHaveBeenCalled();
  });

  it('closes top modal on Escape and ignores game keys when modal is open', () => {
    const enterSpy = vi.fn();
    const modalCloseSpy = vi.fn();
    useGameStore.setState({ enter: enterSpy });

    modalStack.push(modalCloseSpy);
    expect(modalStack.isOpen()).toBe(true);

    renderHook(() => useKeyboard());

    // Game key ignored while modal open
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    expect(enterSpy).not.toHaveBeenCalled();

    // Escape closes top modal
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(modalCloseSpy).toHaveBeenCalledTimes(1);
    expect(modalStack.isOpen()).toBe(false);
  });

  it('ignores keys when typing in an input element', () => {
    const enterSpy = vi.fn();
    useGameStore.setState({ enter: enterSpy });

    renderHook(() => useKeyboard());

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: '7', bubbles: true });
    input.dispatchEvent(event);

    expect(enterSpy).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});

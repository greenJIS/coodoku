import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '../store/settings';
import { useReducedMotion } from './useReducedMotion';
import { useTheme } from './useTheme';

describe('useReducedMotion and useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-motion');
    document.documentElement.removeAttribute('data-theme');
  });

  it('updates data-motion attribute when reduceMotion setting changes', () => {
    useSettingsStore.setState({ reduceMotion: false });
    const { rerender } = renderHook(() => useReducedMotion());
    expect(document.documentElement.getAttribute('data-motion')).toBe('normal');

    useSettingsStore.setState({ reduceMotion: true });
    rerender();
    expect(document.documentElement.getAttribute('data-motion')).toBe(
      'reduced',
    );
  });

  it('updates data-theme attribute when theme setting changes', () => {
    useSettingsStore.setState({ theme: 'light' });
    const { rerender } = renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    useSettingsStore.setState({ theme: 'dark' });
    rerender();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

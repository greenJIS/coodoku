import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGame } from '../../game/cells';
import { engineClient, type EngineGenerator } from '../../store/engine';
import { clearPrefetchCache, useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { useStatsStore } from '../../store/stats';
import { useViewStore } from '../../store/view';
import { makePuzzle } from '../../test/fixtures';
import { HomeScreen } from './HomeScreen';

const handlers = {
  onOpenSettings: vi.fn(),
  onOpenHelp: vi.fn(),
  onOpenAbout: vi.fn(),
};

function renderHome() {
  return render(<HomeScreen {...handlers} />);
}

describe('HomeScreen', () => {
  let generator: EngineGenerator & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    clearPrefetchCache();
    generator = vi.fn(async () => makePuzzle());
    engineClient.setGenerator(generator);
    useViewStore.setState({ view: 'home' });
    useGameStore.setState({ game: null, paused: false, error: null });
    useSettingsStore.setState({ difficulty: 'medium' });
    useStatsStore.setState({
      stats: {
        easy: { solved: 24, bestMs: 252_000 },
        medium: { solved: 11, bestMs: 580_000 },
        hard: { solved: 0, bestMs: null },
        expert: { solved: 0, bestMs: null },
      },
      resetArmed: false,
    });
    Object.values(handlers).forEach((fn) => fn.mockClear());
  });

  afterEach(() => {
    clearPrefetchCache();
    engineClient.resetGenerator();
  });

  it('shows Play and no Continue card without a save', () => {
    renderHome();
    expect(screen.getByRole('button', { name: /^play/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue/i })).toBeNull();
  });

  it('shows solved counts and best times, with a dash when none', () => {
    renderHome();
    expect(screen.getByText(/24 solved/)).toBeInTheDocument();
    expect(screen.getByText(/best 04:12/)).toBeInTheDocument();
    expect(screen.getAllByText(/best —/)).toHaveLength(2);
  });

  it('starts the picked difficulty on Play', async () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /hard/i }));
    fireEvent.click(screen.getByRole('button', { name: /^play hard/i }));
    await waitFor(() => expect(useViewStore.getState().view).toBe('game'));
    expect(generator).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'hard' }),
      expect.anything(),
    );
  });

  it('shows Continue for a playing save and resumes paused', () => {
    useGameStore.setState({ game: createGame(makePuzzle(), 'Saved Otter') });
    renderHome();
    expect(screen.getByText('Saved Otter')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(useViewStore.getState().view).toBe('game');
    expect(useGameStore.getState().paused).toBe(true);
  });

  it('needs two taps on Start to replace a save', async () => {
    useGameStore.setState({ game: createGame(makePuzzle(), 'Saved Otter') });
    renderHome();
    const start = screen.getByRole('button', { name: /start medium game/i });
    fireEvent.click(start);
    expect(generator).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /tap again/i }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /tap again/i }));
    await waitFor(() => expect(useViewStore.getState().view).toBe('game'));
    expect(generator).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'medium' }),
      expect.anything(),
    );
  });

  it('opens help, about and settings through its callbacks', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }));
    fireEvent.click(screen.getByRole('button', { name: /about/i }));
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(handlers.onOpenHelp).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenAbout).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('Enter plays and 1-4 pick a difficulty', async () => {
    renderHome();
    fireEvent.keyDown(window, { key: '4' });
    expect(
      screen.getByRole('button', { name: /^play expert/i }),
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Enter' });
    await waitFor(() => expect(useViewStore.getState().view).toBe('game'));
  });
});

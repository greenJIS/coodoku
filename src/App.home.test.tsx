import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { createGame } from './game/cells';
import { serialize } from './game/save';
import { GAME_KEY, writeKey } from './storage/storage';
import { engineClient, type EngineGenerator } from './store/engine';
import { clearPrefetchCache, useGameStore } from './store/game';
import { useSettingsStore } from './store/settings';
import { useViewStore } from './store/view';
import { makePuzzle } from './test/fixtures';
import { enterGame } from './test/helpers';

describe('App launch flow', () => {
  let generator: EngineGenerator & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    clearPrefetchCache();
    generator = vi.fn(async () => makePuzzle());
    engineClient.setGenerator(generator);
    useViewStore.setState({ view: 'loading' });
    useGameStore.setState({
      game: null,
      paused: false,
      generating: false,
      error: null,
    });
    useSettingsStore.setState({ difficulty: 'easy', sound: false });
  });

  afterEach(() => {
    clearPrefetchCache();
    engineClient.resetGenerator();
  });

  it('opens on Loading, then Home, then the board via Play', async () => {
    render(<App />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    await enterGame();
    expect(screen.getByTestId('sudoku-board')).toBeInTheDocument();
    expect(useViewStore.getState().view).toBe('game');
  });

  it('shows Continue for a saved game and resumes it running', async () => {
    writeKey(GAME_KEY, serialize(createGame(makePuzzle(), 'Saved Otter')));
    render(<App />);
    expect(await screen.findByText('Saved Otter')).toBeInTheDocument();
    expect(generator).not.toHaveBeenCalled();
    await enterGame();
    expect(useGameStore.getState().paused).toBe(false);
    expect(
      screen.queryByRole('dialog', { name: 'Paused game' }),
    ).not.toBeInTheDocument();
  });

  it('the Home button returns to Home with the save intact', async () => {
    render(<App />);
    await enterGame();
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(
      await screen.findByRole('button', { name: /continue/i }),
    ).toBeInTheDocument();
    expect(useGameStore.getState().paused).toBe(true);
  });

  it('Start on Home needs a second tap before replacing a save', async () => {
    writeKey(GAME_KEY, serialize(createGame(makePuzzle(), 'Saved Otter')));
    render(<App />);
    fireEvent.click(
      await screen.findByRole('button', { name: /start easy game/i }),
    );
    expect(generator).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /tap again/i }));
    await waitFor(() => expect(useViewStore.getState().view).toBe('game'));
    expect(generator).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'easy' }),
      expect.anything(),
    );
  });
});

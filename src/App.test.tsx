import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Puzzle } from './engine';
import { createGame } from './game/cells';
import { placeDigit } from './game/rules';
import { serialize } from './game/save';
import { GAME_KEY, writeKey } from './storage/storage';
import { engineClient } from './store/engine';
import { clearPrefetchCache, useGameStore } from './store/game';
import { useSettingsStore } from './store/settings';
import { useStatsStore } from './store/stats';
import { App } from './App';

const VALID_SOLUTION_ARRAY: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5,
  6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5,
  6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5,
  6, 7, 8,
];

// Helper to make nearly-solved puzzle
function makeNearlySolvedPuzzle(emptyCells: number[] = [1]): Puzzle {
  const puzzle = new Uint8Array(81);
  for (let i = 0; i < 81; i++) {
    if (!emptyCells.includes(i)) {
      puzzle[i] = VALID_SOLUTION_ARRAY[i];
    }
  }
  return {
    puzzle,
    solution: Uint8Array.from(VALID_SOLUTION_ARRAY),
    difficulty: 'easy',
    exact: true,
    seed: 42,
    rating: { hardest: 'nakedSingle', counts: {} as never },
  };
}

describe('App full integration test', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPrefetchCache();
    useSettingsStore.setState({
      name: 'Brave Otter',
      difficulty: 'easy',
      mistakeCheck: true,
      autoRemoveNotes: true,
      sound: false,
      vibrate: false,
      showTimer: true,
      showRemaining: true,
    });
    useStatsStore.setState({
      stats: {
        easy: { solved: 0, bestMs: null },
        medium: { solved: 0, bestMs: null },
        hard: { solved: 0, bestMs: null },
        expert: { solved: 0, bestMs: null },
      },
      resetArmed: false,
    });
    useGameStore.setState({
      game: null,
      selected: null,
      paused: false,
      generating: false,
      error: null,
      pendingDifficulty: null,
      newBest: false,
    });
    document.body.innerHTML = '';
  });

  afterEach(() => {
    clearPrefetchCache();
    engineClient.resetGenerator();
  });

  it('does not show the Pause modal after Help or Settings closes', async () => {
    engineClient.setGenerator(async () => makeNearlySolvedPuzzle([1]));
    render(<App />);
    await waitFor(() => expect(useGameStore.getState().game).not.toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'About notes' }));
    expect(
      screen.getByRole('dialog', { name: /help and rules/i }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^close/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useGameStore.getState().paused).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: /close settings/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useGameStore.getState().paused).toBe(false);
  });

  it('boots into a game and places a digit', async () => {
    // Puzzle with cell 1 empty (solution is 2)
    const puzzle = makeNearlySolvedPuzzle([1]);
    engineClient.setGenerator(async () => puzzle);

    render(<App />);

    // Wait for boot to load game
    await waitFor(() => {
      expect(screen.getByText('Brave Otter')).toBeInTheDocument();
      expect(screen.getByTestId('sudoku-board')).toBeInTheDocument();
    });

    // Cell 1 is empty initially
    const cell1 = screen.getAllByRole('gridcell')[1];
    expect(cell1).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty'),
    );

    // Select cell 1
    fireEvent.click(cell1);
    expect(useGameStore.getState().selected).toBe(1);

    // Click digit 2 on number pad
    const btn2 = screen.getByRole('button', { name: /Digit 2/ });
    fireEvent.click(btn2);

    // Cell 1 now contains 2
    expect(cell1).toHaveTextContent('2');
  });

  it('loses all hearts and displays game over modal', async () => {
    const puzzle = makeNearlySolvedPuzzle([1, 2]);
    engineClient.setGenerator(async () => puzzle);

    render(<App />);
    await waitFor(() => {
      expect(useGameStore.getState().generating).toBe(false);
      expect(useGameStore.getState().game).not.toBeNull();
    });

    // Set hearts to 1
    let game = useGameStore.getState().game!;
    game = { ...game, hearts: 1 };
    useGameStore.setState({ game, selected: 1 });

    // Place a wrong digit (cell 1 solution is 2, place 3 which is available because cell 2 is also empty)
    const btn3 = screen.getByRole('button', { name: /Digit 3/ });
    fireEvent.click(btn3);

    // Hearts hit 0 -> Game over modal appears
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Game Over' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Out of hearts')).toBeInTheDocument();
    });
  });

  it('solves puzzle and displays win modal with new game action', async () => {
    // Only cell 1 empty, solution is 2
    const puzzle = makeNearlySolvedPuzzle([1]);
    engineClient.setGenerator(async () => puzzle);

    render(<App />);
    await waitFor(() => {
      expect(useGameStore.getState().generating).toBe(false);
      expect(useGameStore.getState().game).not.toBeNull();
    });

    // Select cell 1 and place correct digit 2
    const cell1 = screen.getAllByRole('gridcell')[1];
    fireEvent.click(cell1);

    const btn2 = screen.getByRole('button', { name: /Digit 2/ });
    fireEvent.click(btn2);

    // Win modal appears
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Puzzle Solved!' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Solved!')).toBeInTheDocument();
    });
  });

  it('resumes saved game with Pause modal open on refresh', async () => {
    // Pre-save an in-progress game in localStorage
    const puzzle = makeNearlySolvedPuzzle([1, 2]);
    let savedGame = createGame(puzzle, 'Saved Otter');
    // Place digit in cell 1
    savedGame = placeDigit(savedGame, 1, 2, {
      mistakeCheck: true,
      autoRemoveNotes: false,
    });
    writeKey(GAME_KEY, serialize(savedGame));

    // Boot app
    render(<App />);

    // Resumes in paused state with Pause modal open
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Paused game' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    // Board behind is paused/blurred, cell 1 has the saved digit '2'
    const cell1 = screen.getAllByRole('gridcell')[1];
    expect(cell1).toHaveTextContent('2');

    // Click Play to resume
    const playBtn = screen.getByRole('button', { name: 'Resume game' });
    fireEvent.click(playBtn);

    expect(
      screen.queryByRole('dialog', { name: 'Paused game' }),
    ).not.toBeInTheDocument();
    expect(useGameStore.getState().paused).toBe(false);
  });
});

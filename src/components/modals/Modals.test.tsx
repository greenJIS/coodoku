import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Puzzle } from '../../engine';
import { createGame } from '../../game/cells';
import { placeDigit } from '../../game/rules';
import { modalStack } from '../../hooks/modalStack';
import { useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { useStatsStore } from '../../store/stats';
import { useViewStore } from '../../store/view';
import {
  ConfirmDifficultyModal,
  GameOverModal,
  HelpModal,
  Modal,
  PauseModal,
  SettingsModal,
  WinModal,
} from './index';

const samplePuzzle: Puzzle = {
  puzzle: Uint8Array.from([
    5, 3, 0, 0, 7, 0, 0, 0, 0, 6, 0, 0, 1, 9, 5, 0, 0, 0, 0, 9, 8, 0, 0, 0, 0,
    6, 0, 8, 0, 0, 0, 6, 0, 0, 0, 3, 4, 0, 0, 8, 0, 3, 0, 0, 1, 7, 0, 0, 0, 2,
    0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 2, 8, 0, 0, 0, 0, 4, 1, 9, 0, 0, 5, 0, 0, 0,
    0, 8, 0, 0, 7, 9,
  ]),
  solution: Uint8Array.from([
    5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5,
    6, 7, 8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2,
    4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5,
    2, 8, 6, 1, 7, 9,
  ]),
  difficulty: 'easy',
  seed: 12345,
  exact: true,
  rating: { hardest: 'nakedSingle', counts: { nakedSingle: 1 } as never },
};

describe('Game Modals', () => {
  beforeEach(() => {
    modalStack.clear();
    useViewStore.setState({ view: 'game' });
    const game = createGame(samplePuzzle, 'Brave Otter');
    useGameStore.setState({
      game,
      selected: null,
      paused: false,
      pendingDifficulty: null,
      newBest: false,
    });
    useSettingsStore.setState({
      name: 'Brave Otter',
      difficulty: 'easy',
      mistakeCheck: true,
      sound: true,
      digitSize: 'normal',
    });
    useStatsStore.setState({
      stats: {
        easy: { solved: 5, bestMs: 120000 },
        medium: { solved: 2, bestMs: 250000 },
        hard: { solved: 0, bestMs: null },
        expert: { solved: 0, bestMs: null },
      },
      resetArmed: false,
    });
    document.body.innerHTML = '';
  });

  describe('Modal', () => {
    it('plays the exit animation before unmounting', async () => {
      const { rerender } = render(
        <Modal open onClose={vi.fn()} label="Demo">
          <p>body</p>
        </Modal>,
      );
      expect(screen.getByRole('dialog').className).toContain(
        'animate-modal-in',
      );

      rerender(
        <Modal open={false} onClose={vi.fn()} label="Demo">
          <p>body</p>
        </Modal>,
      );
      expect(screen.getByRole('dialog').className).toContain(
        'animate-modal-out',
      );
      expect(screen.getByTestId('modal-backdrop').className).toContain(
        'pointer-events-none',
      );

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
  });

  describe('PauseModal', () => {
    it('resumes immediately on Play button click', () => {
      const onClose = vi.fn();
      render(<PauseModal open={true} onClose={onClose} />);

      const playBtn = screen.getByRole('button', { name: 'Resume game' });
      fireEvent.click(playBtn);

      expect(useGameStore.getState().paused).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('requires two taps to reset puzzle', () => {
      const retrySpy = vi.spyOn(useGameStore.getState(), 'retry');
      const onClose = vi.fn();
      render(<PauseModal open={true} onClose={onClose} />);

      const resetBtn = screen.getByRole('button', { name: 'Reset puzzle' });

      // First tap arms the button
      fireEvent.click(resetBtn);
      expect(retrySpy).not.toHaveBeenCalled();
      expect(resetBtn).toHaveTextContent('Tap again to reset');

      // Second tap triggers reset
      fireEvent.click(resetBtn);
      expect(retrySpy).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('requires two taps to confirm new game', () => {
      const newGameSpy = vi.spyOn(useGameStore.getState(), 'newGame');
      const onClose = vi.fn();
      render(<PauseModal open={true} onClose={onClose} />);

      const newBtn = screen.getByRole('button', { name: 'New game' });

      // First tap arms
      fireEvent.click(newBtn);
      expect(newGameSpy).not.toHaveBeenCalled();
      expect(newBtn).toHaveTextContent('Tap again to confirm');

      // Second tap starts new game
      fireEvent.click(newBtn);
      expect(newGameSpy).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('SettingsModal', () => {
    it('switches tabs and persists settings', () => {
      const onClose = vi.fn();
      render(<SettingsModal open={true} onClose={onClose} />);

      // Switch to Play tab
      const playTab = screen.getByRole('tab', { name: 'Play' });
      fireEvent.click(playTab);

      // Toggle auto-remove notes
      const autoNotesToggle = screen.getByRole('switch', {
        name: 'Auto-remove notes',
      });
      fireEvent.click(autoNotesToggle);
      expect(useSettingsStore.getState().autoRemoveNotes).toBe(false);

      // Switch to Look & feel tab
      const feelTab = screen.getByRole('tab', { name: 'Look & feel' });
      fireEvent.click(feelTab);

      // Toggle reduce motion
      const motionToggle = screen.getByRole('switch', {
        name: 'Reduce motion',
      });
      fireEvent.click(motionToggle);
      expect(useSettingsStore.getState().reduceMotion).toBe(true);
    });

    it('handles game name field: trims, restores previous on empty, dice button updates name', () => {
      const onClose = vi.fn();
      render(<SettingsModal open={true} onClose={onClose} />);

      const nameInput = screen.getByLabelText('Game name');
      expect(nameInput).toHaveValue('Brave Otter');

      // Typing new name and blur trims
      fireEvent.change(nameInput, { target: { value: '  Lucky Fox  ' } });
      fireEvent.blur(nameInput);
      expect(useSettingsStore.getState().name).toBe('Lucky Fox');
      expect(nameInput).toHaveValue('Lucky Fox');

      // Empty input on blur reverts to previous name
      fireEvent.change(nameInput, { target: { value: '   ' } });
      fireEvent.blur(nameInput);
      expect(useSettingsStore.getState().name).toBe('Lucky Fox');
      expect(nameInput).toHaveValue('Lucky Fox');

      // Dice button generates random name
      const diceBtn = screen.getByRole('button', { name: 'Random name' });
      fireEvent.click(diceBtn);
      expect(useSettingsStore.getState().name).not.toBe('Lucky Fox');
    });

    it('requires two taps to reset stats', () => {
      const resetSpy = vi.spyOn(useStatsStore.getState(), 'reset');
      const onClose = vi.fn();
      render(<SettingsModal open={true} onClose={onClose} />);

      const resetBtn = screen.getByRole('button', { name: 'Reset stats' });

      // First tap arms button
      fireEvent.click(resetBtn);
      expect(resetSpy).not.toHaveBeenCalled();
      expect(resetBtn).toHaveTextContent('Tap again to confirm');

      // Second tap resets stats
      fireEvent.click(resetBtn);
      expect(resetSpy).toHaveBeenCalledTimes(1);
    });

    it('triggers difficulty change confirmation when game has progress and snaps back on cancel', () => {
      let game = useGameStore.getState().game!;
      // Add progress by placing digit
      game = placeDigit(game, 2, 4, {
        mistakeCheck: true,
        autoRemoveNotes: false,
      });
      useGameStore.setState({ game });

      const onClose = vi.fn();
      render(<SettingsModal open={true} onClose={onClose} />);

      // Request Medium difficulty
      const mediumBtn = screen.getByRole('button', { name: 'Medium' });
      fireEvent.click(mediumBtn);

      // Confirm modal opens because game has progress
      expect(useGameStore.getState().pendingDifficulty).toBe('medium');
      expect(screen.getByText('Change to Medium?')).toBeInTheDocument();

      // Click Keep playing to cancel
      const keepBtn = screen.getByRole('button', { name: 'Keep playing' });
      fireEvent.click(keepBtn);

      // Snaps back
      expect(useGameStore.getState().pendingDifficulty).toBeNull();
      expect(useSettingsStore.getState().difficulty).toBe('easy');
    });
  });

  describe('ConfirmDifficultyModal', () => {
    it('calls confirmDifficulty on confirm button', () => {
      const confirmSpy = vi
        .spyOn(useGameStore.getState(), 'confirmDifficulty')
        .mockImplementation(() => {});
      useGameStore.setState({ pendingDifficulty: 'hard' });

      render(<ConfirmDifficultyModal open={true} />);

      const confirmBtn = screen.getByRole('button', { name: 'New game' });
      fireEvent.click(confirmBtn);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('WinModal and GameOverModal', () => {
    it('renders win modal with time and new best badge', () => {
      let game = useGameStore.getState().game!;
      game = { ...game, elapsedMs: 95000 };
      useGameStore.setState({ game, newBest: true });

      const onNewGame = vi.fn();
      render(<WinModal open={true} onNewGame={onNewGame} />);

      expect(screen.getByText('Nicely done!')).toBeInTheDocument();
      expect(screen.getByText(/01:35 \u00b7 New best!$/)).toBeInTheDocument();

      const newBtn = screen.getByRole('button', { name: 'New game' });
      fireEvent.click(newBtn);
      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('renders game over modal with retry and new game options', () => {
      const onRetry = vi.fn();
      const onNewGame = vi.fn();
      render(
        <GameOverModal open={true} onRetry={onRetry} onNewGame={onNewGame} />,
      );

      expect(screen.getByText('Oh no, out of tries')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Retry puzzle' }));
      expect(onRetry).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'New game' }));
      expect(onNewGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('HelpModal', () => {
    it('renders the notes topic and close button', () => {
      const onClose = vi.fn();
      render(<HelpModal open={true} onClose={onClose} topic="notes" />);

      expect(screen.getByText('Not sure yet?')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('pages through the hint topic', () => {
      render(<HelpModal open={true} onClose={vi.fn()} topic="hint" />);

      expect(screen.getByText('Feeling stuck?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(screen.getByText('Hints are limited')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
      expect(screen.getByText('Feeling stuck?')).toBeInTheDocument();
    });
  });
});

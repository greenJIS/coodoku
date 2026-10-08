import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Puzzle } from '../engine';
import { createGame } from '../game/cells';
import { formatTime } from '../lib/time';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { useViewStore } from '../store/view';
import { Header } from './Header';
import { HeartRow } from './HeartRow';
import { Timer } from './Timer';

const samplePuzzle: Puzzle = {
  puzzle: new Uint8Array(81).fill(0),
  solution: new Uint8Array(81).fill(1),
  difficulty: 'hard',
  seed: 12345,
  exact: true,
  rating: { hardest: 'nakedSingle', counts: { nakedSingle: 1 } as never },
};

describe('Header, HeartRow, and Timer', () => {
  beforeEach(() => {
    useViewStore.setState({ view: 'game' });
    const game = createGame(samplePuzzle, 'Clever Otter');
    useGameStore.setState({
      game,
    });
    useSettingsStore.setState({
      name: 'Clever Otter',
      difficulty: 'easy', // requested might be easy, but puzzle is hard
      showTimer: true,
    });
  });

  describe('Header', () => {
    it('renders an enabled Home button that goes home', () => {
      render(<Header />);
      const homeBtn = screen.getByRole('button', { name: 'Home' });
      expect(homeBtn).not.toHaveAttribute('aria-disabled');
      fireEvent.click(homeBtn);
      expect(useViewStore.getState().view).toBe('home');
      expect(useGameStore.getState().paused).toBe(true);
    });

    it('renders Otter mascot and game name', () => {
      render(<Header />);
      expect(screen.getByText('Clever Otter')).toBeInTheDocument();
    });

    it('calls onOpenSettings when gear button clicked', () => {
      const onOpenSettings = vi.fn();
      render(<Header onOpenSettings={onOpenSettings} />);

      const settingsBtn = screen.getByRole('button', { name: 'Settings' });
      fireEvent.click(settingsBtn);
      expect(onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('shows difficulty actually received from game with dot indicators', () => {
      render(<Header />);
      // Game puzzle has difficulty: 'hard' even if settings said easy
      expect(screen.getByText('Hard')).toBeInTheDocument();
    });

    it('renders timer and pause button when showTimer is true, calls onPause', () => {
      const onPause = vi.fn();
      render(<Header onPause={onPause} />);

      expect(screen.getByTestId('game-timer')).toBeInTheDocument();
      const pauseBtn = screen.getByRole('button', { name: 'Pause' });
      expect(pauseBtn).toBeInTheDocument();

      fireEvent.click(pauseBtn);
      expect(onPause).toHaveBeenCalledTimes(1);
    });

    it('removes timer and pause button completely when showTimer is false', () => {
      useSettingsStore.setState({ showTimer: false });
      render(<Header />);

      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Pause' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('HeartRow', () => {
    it('renders 5 hearts and reflects heart count in aria-label', () => {
      render(<HeartRow hearts={3} />);

      const group = screen.getByTestId('heart-row');
      expect(group).toHaveAttribute('aria-label', '3 of 5 hearts remaining');
      expect(group.children).toHaveLength(5);
    });

    it('reads hearts from game store if not provided explicitly', () => {
      let game = useGameStore.getState().game!;
      game = { ...game, hearts: 2 };
      useGameStore.setState({ game });

      render(<HeartRow />);
      const group = screen.getByTestId('heart-row');
      expect(group).toHaveAttribute('aria-label', '2 of 5 hearts remaining');
    });
  });

  describe('Timer', () => {
    it('formats time mm:ss and hh:mm:ss correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(65000)).toBe('01:05');
      expect(formatTime(3665000)).toBe('01:01:05');
    });

    it('renders formatted elapsed time from store', () => {
      let game = useGameStore.getState().game!;
      game = { ...game, elapsedMs: 125000 }; // 02:05
      useGameStore.setState({ game });

      render(<Timer />);
      const timer = screen.getByTestId('game-timer');
      expect(timer).toHaveTextContent('02:05');
      expect(timer).toHaveAttribute('aria-label', 'Elapsed time 02:05');
    });
  });
});

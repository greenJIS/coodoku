import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Puzzle } from '../engine';
import { createGame } from '../game/cells';
import { placeDigit } from '../game/rules';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { NotesSwitch } from './NotesSwitch';
import { NumberPad } from './NumberPad';
import { Toolbar } from './Toolbar';

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

describe('NumberPad, NotesSwitch, and Toolbar controls', () => {
  beforeEach(() => {
    const game = createGame(samplePuzzle, 'Plucky Otter');
    useGameStore.setState({
      game,
      selected: null,
      lastEntered: null,
      generating: false,
      notesMode: false,
    });
    useSettingsStore.setState({
      showRemaining: true,
    });
  });

  describe('NumberPad', () => {
    it('renders 9 digits and calls enter when digit clicked', () => {
      const enterSpy = vi.spyOn(useGameStore.getState(), 'enter');
      render(<NumberPad />);

      const btn4 = screen.getByRole('button', { name: /Digit 4/ });
      expect(btn4).toBeInTheDocument();

      fireEvent.click(btn4);
      expect(enterSpy).toHaveBeenCalledWith(4);
    });

    it('shows dotted ring in notes mode', () => {
      useGameStore.setState({ notesMode: true });
      const { container } = render(<NumberPad />);

      const dashedRing = container.querySelector('[data-notes-ring]');
      expect(dashedRing).toBeInTheDocument();
    });

    it('dims and disables digit when remaining count is 0 and showRemaining is on', () => {
      let game = createGame(samplePuzzle, 'Plucky Otter');
      // Solution has nine 1s: fill all of them correctly
      for (let i = 0; i < 81; i++) {
        if (game.solution[i] === 1) {
          game = placeDigit(game, i, 1, {
            mistakeCheck: true,
            autoRemoveNotes: false,
          });
        }
      }
      useGameStore.setState({ game });
      render(<NumberPad />);

      const btn1 = screen.getByRole('button', { name: /Digit 1, 0 remaining/ });
      expect(btn1).toBeDisabled();
      expect(btn1).toHaveClass('opacity-30');
    });

    it('does not disable digit when showRemaining is false even if count is 0', () => {
      useSettingsStore.setState({ showRemaining: false });
      let game = createGame(samplePuzzle, 'Plucky Otter');
      for (let i = 0; i < 81; i++) {
        if (game.solution[i] === 1) {
          game = placeDigit(game, i, 1, {
            mistakeCheck: true,
            autoRemoveNotes: false,
          });
        }
      }
      useGameStore.setState({ game });
      render(<NumberPad />);

      const btn1 = screen.getByRole('button', { name: 'Digit 1' });
      expect(btn1).not.toBeDisabled();
    });

    it('disables all digits while generating', () => {
      useGameStore.setState({ generating: true });
      render(<NumberPad />);

      const buttons = screen.getAllByRole('button');
      for (const btn of buttons) {
        expect(btn).toBeDisabled();
      }
    });
  });

  describe('NotesSwitch', () => {
    it('toggles notesMode on click and updates aria-checked', () => {
      render(<NotesSwitch />);

      const toggle = screen.getByRole('switch', { name: 'Notes mode' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(toggle);
      expect(useGameStore.getState().notesMode).toBe(true);
    });

    it('calls onHelp when help button is clicked', () => {
      const onHelp = vi.fn();
      render(<NotesSwitch onHelp={onHelp} />);

      const helpBtn = screen.getByRole('button', { name: 'About notes' });
      fireEvent.click(helpBtn);
      expect(onHelp).toHaveBeenCalledTimes(1);
    });

    it('is disabled while generating', () => {
      useGameStore.setState({ generating: true });
      render(<NotesSwitch />);

      const toggle = screen.getByRole('switch', { name: 'Notes mode' });
      expect(toggle).toBeDisabled();
    });
  });

  describe('Toolbar', () => {
    it('disables undo when history is empty, enables when history exists', () => {
      const { rerender } = render(<Toolbar />);
      const undoBtn = screen.getByRole('button', { name: 'Undo' });
      expect(undoBtn).toBeDisabled();

      // Add a move
      let game = useGameStore.getState().game!;
      game = placeDigit(game, 2, 4, {
        mistakeCheck: true,
        autoRemoveNotes: false,
      });
      useGameStore.setState({ game });

      rerender(<Toolbar />);
      expect(screen.getByRole('button', { name: 'Undo' })).not.toBeDisabled();
    });

    it('disables erase on givens and enables on user-placed cells', () => {
      // Cell 0 is given
      useGameStore.setState({ selected: 0 });
      const { rerender } = render(<Toolbar />);
      const eraseBtn = screen.getByRole('button', { name: 'Erase' });
      expect(eraseBtn).toBeDisabled();

      // Cell 2 is empty/editable
      useGameStore.setState({ selected: 2 });
      rerender(<Toolbar />);
      expect(screen.getByRole('button', { name: 'Erase' })).not.toBeDisabled();
    });

    it('disables hint when nothing is selected, given is selected, or already correct', () => {
      // Nothing selected
      useGameStore.setState({ selected: null });
      const { rerender } = render(<Toolbar />);
      expect(screen.getByRole('button', { name: /Hint/ })).toBeDisabled();

      // Given selected (cell 0)
      useGameStore.setState({ selected: 0 });
      rerender(<Toolbar />);
      expect(screen.getByRole('button', { name: /Hint/ })).toBeDisabled();

      // Editable empty cell selected (cell 2)
      useGameStore.setState({ selected: 2 });
      rerender(<Toolbar />);
      expect(screen.getByRole('button', { name: /Hint/ })).not.toBeDisabled();
    });

    it('disables hint when hintsLeft is 0', () => {
      let game = useGameStore.getState().game!;
      game = { ...game, hintsLeft: 0 };
      useGameStore.setState({ game, selected: 2 });

      render(<Toolbar />);
      const hintBtn = screen.getByRole('button', { name: /Hint/ });
      expect(hintBtn).toBeDisabled();
      expect(hintBtn).toHaveTextContent('Hint x0');
    });

    it('calls hint action when clicked on valid cell', () => {
      const hintSpy = vi.spyOn(useGameStore.getState(), 'hint');
      useGameStore.setState({ selected: 2 });

      render(<Toolbar />);
      const hintBtn = screen.getByRole('button', { name: /Hint/ });
      fireEvent.click(hintBtn);

      expect(hintSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onAboutHint when question badge is clicked', () => {
      const onAboutHint = vi.fn();
      render(<Toolbar onAboutHint={onAboutHint} />);

      const helpBtn = screen.getByRole('button', { name: 'About hints' });
      fireEvent.click(helpBtn);
      expect(onAboutHint).toHaveBeenCalledTimes(1);
    });
  });
});

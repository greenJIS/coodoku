import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Puzzle } from '../engine';
import { createGame } from '../game/cells';
import { placeDigit, toggleNote } from '../game/rules';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { Board } from './Board';

// Sample fixture puzzle
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

describe('Board and Cell components', () => {
  beforeEach(() => {
    // Reset stores to known state
    const game = createGame(samplePuzzle, 'Calm Otter');
    useGameStore.setState({
      game,
      selected: null,
      lastEntered: null,
      generating: false,
      notesMode: false,
    });
    useSettingsStore.setState({
      highlightPeers: true,
      highlightSame: true,
      digitSize: 'normal',
    });
  });

  it('renders 81 cells with data-cell attributes and proper role', () => {
    render(<Board />);

    const grid = screen.getByRole('grid', { name: 'Sudoku board' });
    expect(grid).toBeInTheDocument();

    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(81);
    expect(cells[0]).toHaveAttribute('data-cell', '0');
    expect(cells[80]).toHaveAttribute('data-cell', '80');
  });

  it('renders given versus user placed cell styling and correct aria-labels', () => {
    let game = createGame(samplePuzzle, 'Calm Otter');
    // Place a correct digit at cell 2 (solution is 4)
    game = placeDigit(game, 2, 4, {
      mistakeCheck: true,
      autoRemoveNotes: false,
    });
    // Place a wrong digit at cell 3 (solution is 6, place 1)
    game = placeDigit(game, 3, 1, {
      mistakeCheck: true,
      autoRemoveNotes: false,
    });

    useGameStore.setState({ game });
    render(<Board />);

    const cells = screen.getAllByRole('gridcell');

    // Cell 0 is a given (value 5)
    expect(cells[0]).toHaveTextContent('5');
    expect(cells[0]).toHaveAttribute('aria-label', 'row 1, column 1, 5, given');

    // Cell 2 is user placed (value 4)
    expect(cells[2]).toHaveTextContent('4');
    expect(cells[2]).toHaveAttribute('aria-label', 'row 1, column 3, 4');
    expect(cells[2]).not.toHaveAttribute(
      'aria-label',
      expect.stringContaining('given'),
    );

    // Cell 3 is a mistake (wrong digit 1)
    expect(cells[3]).toHaveTextContent('1');
    expect(cells[3]).toHaveAttribute('aria-label', 'row 1, column 4, 1, wrong');
    expect(cells[3].querySelector('span')).toHaveClass('text-error');
  });

  it('click selects cell and updates roving tabindex', () => {
    render(<Board />);
    const cells = screen.getAllByRole('gridcell');

    // Initially cell 0 has tabindex 0, cell 1 has -1
    expect(cells[0]).toHaveAttribute('tabIndex', '0');
    expect(cells[1]).toHaveAttribute('tabIndex', '-1');

    // Click cell 1
    fireEvent.click(cells[1]);

    expect(useGameStore.getState().selected).toBe(1);
    expect(cells[1]).toHaveAttribute('tabIndex', '0');
    expect(cells[1]).toHaveAttribute('aria-selected', 'true');
    expect(cells[0]).toHaveAttribute('tabIndex', '-1');
  });

  it('highlights peers when setting is enabled and hides them when disabled', () => {
    useGameStore.setState({ selected: 0 }); // Cell 0 selected (row 0, col 0)
    const { rerender } = render(<Board />);

    const cells = screen.getAllByRole('gridcell');
    // Cell 1 is peer of cell 0 (same row)
    expect(cells[1]).toHaveClass('bg-brand-100');

    // Turn off highlightPeers setting
    useSettingsStore.setState({ highlightPeers: false });
    rerender(<Board />);

    expect(cells[1]).not.toHaveClass('bg-brand-100');
  });

  it('highlights same-digit cells when setting is enabled and hides them when disabled', () => {
    // Cell 0 has value 5. Cell 14 (row 1, col 5) also has given value 5.
    useGameStore.setState({ selected: 0 });
    const { rerender, container } = render(<Board />);

    // Cell 14 has value 5, should show same-digit leaf outline
    const cell14 = screen.getAllByRole('gridcell')[14];
    expect(cell14).toHaveTextContent('5');
    const outline = cell14.querySelector('.border-accent-500');
    expect(outline).toBeInTheDocument();

    // Turn off highlightSame setting
    useSettingsStore.setState({ highlightSame: false });
    rerender(<Board />);

    const cell14After = container.querySelector('[data-cell="14"]');
    expect(cell14After?.querySelector('.border-accent-500')).toBeNull();
  });

  it('renders 3x3 notes subgrid on empty cells with notes', () => {
    let game = createGame(samplePuzzle, 'Calm Otter');
    game = toggleNote(game, 2, 4);
    game = toggleNote(game, 2, 7);

    useGameStore.setState({ game });
    render(<Board />);

    const cell2 = screen.getAllByRole('gridcell')[2];
    expect(cell2).toHaveAttribute(
      'aria-label',
      expect.stringContaining('notes 4, 7'),
    );
    expect(cell2).toHaveTextContent('4');
    expect(cell2).toHaveTextContent('7');
  });

  it('shows generating skeleton overlay when generating is true', () => {
    useGameStore.setState({ generating: true });
    render(<Board />);

    expect(screen.getByTestId('board-skeleton')).toBeInTheDocument();
  });
});

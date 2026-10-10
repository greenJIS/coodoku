import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGame } from '../game/cells';
import { useGameStore } from '../store/game';
import { makePuzzle } from '../test/fixtures';
import { EraseButton } from './EraseButton';

const originalErase = useGameStore.getState().erase;

describe('EraseButton', () => {
  beforeEach(() => {
    useGameStore.setState({
      game: createGame(makePuzzle([2]), 'Plucky Otter'),
      selected: null,
      generating: false,
      erase: originalErase,
    });
  });

  it.each(['toolbar', 'pad'] as const)(
    'is disabled with no selection or a given selected (%s)',
    (variant) => {
      const { rerender } = render(<EraseButton variant={variant} />);
      expect(screen.getByRole('button', { name: 'Erase' })).toBeDisabled();

      useGameStore.setState({ selected: 0 });
      rerender(<EraseButton variant={variant} />);
      expect(screen.getByRole('button', { name: 'Erase' })).toBeDisabled();

      useGameStore.setState({ selected: 2 });
      rerender(<EraseButton variant={variant} />);
      expect(screen.getByRole('button', { name: 'Erase' })).not.toBeDisabled();
    },
  );

  it.each(['toolbar', 'pad'] as const)(
    'calls the store erase action on click (%s)',
    (variant) => {
      const erase = vi.fn();
      useGameStore.setState({ selected: 2, erase });
      render(<EraseButton variant={variant} />);
      fireEvent.click(screen.getByRole('button', { name: 'Erase' }));
      expect(erase).toHaveBeenCalledTimes(1);
    },
  );
});

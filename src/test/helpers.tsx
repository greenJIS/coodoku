import { fireEvent, screen } from '@testing-library/react';

/** From Home: click Play or Continue and wait for the board. */
export async function enterGame(): Promise<void> {
  const button = await screen.findByRole('button', {
    name: /^(play|continue)/i,
  });
  fireEvent.click(button);
  await screen.findByTestId('sudoku-board');
}

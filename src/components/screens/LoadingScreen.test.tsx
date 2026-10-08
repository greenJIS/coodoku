import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders a status overlay with the mini board', () => {
    render(<LoadingScreen leaving={false} />);
    const status = screen.getByRole('status', { name: 'Loading' });
    expect(status).toHaveClass('opacity-100');
    expect(screen.getAllByTestId('mini-cell')).toHaveLength(81);
    expect(screen.getByText(/shuffling the pebbles/i)).toBeInTheDocument();
  });

  it('fades out and stops catching clicks when leaving', () => {
    render(<LoadingScreen leaving />);
    const status = screen.getByRole('status', { name: 'Loading' });
    expect(status).toHaveClass('opacity-0');
    expect(status).toHaveClass('pointer-events-none');
  });
});

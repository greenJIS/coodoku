import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AboutModal } from './AboutModal';
import { HelpModal } from './HelpModal';

describe('AboutModal', () => {
  it('shows credits and closes', () => {
    const onClose = vi.fn();
    render(<AboutModal open onClose={onClose} />);
    expect(
      screen.getByRole('dialog', { name: 'About Coodoku' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/patrick hand/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close about/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('HelpModal rules topic', () => {
  it('explains the rules', () => {
    render(<HelpModal open onClose={vi.fn()} topic="rules" />);
    expect(screen.getByText(/digits 1 to 9, once each/i)).toBeInTheDocument();
  });
});

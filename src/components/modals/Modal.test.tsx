import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { modalStack } from '../../hooks/modalStack';
import { useGameStore } from '../../store/game';
import { Modal } from './Modal';

describe('Modal Primitive', () => {
  beforeEach(() => {
    modalStack.clear();
    useGameStore.setState({ paused: false });
    document.body.innerHTML = '';
  });

  it('renders dialog with aria-modal and label, traps focus with Tab and Shift+Tab', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} label="Test Modal">
        <button data-testid="btn-1">First</button>
        <button data-testid="btn-2">Second</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Test Modal' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const btn1 = screen.getByTestId('btn-1');
    const btn2 = screen.getByTestId('btn-2');

    // First button receives initial focus
    expect(btn1).toHaveFocus();

    // Tab from last button wraps to first
    btn2.focus();
    expect(btn2).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(btn1).toHaveFocus();

    // Shift+Tab from first button wraps to last
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(btn2).toHaveFocus();
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} label="Test Modal">
        <p>Content</p>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Test Modal' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles stacked modals: only top modal closes on Escape', () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();

    const { rerender } = render(
      <>
        <Modal open={true} onClose={onClose1} label="Modal 1">
          <p>Modal 1 content</p>
        </Modal>
      </>,
    );

    rerender(
      <>
        <Modal open={true} onClose={onClose1} label="Modal 1">
          <p>Modal 1 content</p>
        </Modal>
        <Modal open={true} onClose={onClose2} label="Modal 2">
          <p>Modal 2 content</p>
        </Modal>
      </>,
    );

    const dialog2 = screen.getByRole('dialog', { name: 'Modal 2' });
    fireEvent.keyDown(dialog2, { key: 'Escape' });

    // Only top modal (Modal 2) was called
    expect(onClose2).toHaveBeenCalledTimes(1);
    expect(onClose1).not.toHaveBeenCalled();
  });

  it('restores focus to trigger element on close', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(trigger).toHaveFocus();

    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open={true} onClose={onClose} label="Focus Test">
        <button>Inside</button>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close modal
    rerender(
      <Modal open={false} onClose={onClose} label="Focus Test">
        <button>Inside</button>
      </Modal>,
    );

    expect(trigger).toHaveFocus();
  });

  it('coordinates paused state with stacked modals', () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();

    expect(useGameStore.getState().paused).toBe(false);

    // Open first modal -> paused becomes true
    const { rerender } = render(
      <Modal open={true} onClose={onClose1} label="Modal 1">
        <div>1</div>
      </Modal>,
    );
    expect(useGameStore.getState().paused).toBe(true);

    // Open second modal -> paused remains true
    rerender(
      <>
        <Modal open={true} onClose={onClose1} label="Modal 1">
          <div>1</div>
        </Modal>
        <Modal open={true} onClose={onClose2} label="Modal 2">
          <div>2</div>
        </Modal>
      </>,
    );
    expect(useGameStore.getState().paused).toBe(true);

    // Close second modal -> paused still true because Modal 1 is open
    rerender(
      <Modal open={true} onClose={onClose1} label="Modal 1">
        <div>1</div>
      </Modal>,
    );
    expect(useGameStore.getState().paused).toBe(true);

    // Close first modal -> paused becomes false
    rerender(
      <Modal open={false} onClose={onClose1} label="Modal 1">
        <div>1</div>
      </Modal>,
    );
    expect(useGameStore.getState().paused).toBe(false);
  });

  it('closes when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} label="Backdrop test">
        <p>Inside</p>
      </Modal>,
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

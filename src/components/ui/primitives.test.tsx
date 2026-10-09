import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Otter } from '../brand/Otter';
import { GearIcon } from '../icons';
import {
  IconButton,
  Segmented,
  Slider,
  StickerButton,
  Tabs,
  Toast,
  Toggle,
} from './index';

describe('UI Primitives', () => {
  describe('Toggle', () => {
    it('fires onChange with new boolean state on click', () => {
      const onChange = vi.fn();
      render(
        <Toggle checked={false} onChange={onChange} aria-label="Auto notes" />,
      );

      const toggle = screen.getByRole('switch', { name: 'Auto notes' });
      expect(toggle).not.toBeChecked();

      fireEvent.click(toggle);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('fires onChange(false) when currently checked', () => {
      const onChange = vi.fn();
      render(
        <Toggle checked={true} onChange={onChange} aria-label="Auto notes" />,
      );

      const toggle = screen.getByRole('switch', { name: 'Auto notes' });
      expect(toggle).toBeChecked();

      fireEvent.click(toggle);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('does not fire onChange when disabled', () => {
      const onChange = vi.fn();
      render(
        <Toggle
          checked={false}
          disabled={true}
          onChange={onChange}
          aria-label="Disabled toggle"
        />,
      );

      const toggle = screen.getByRole('switch', { name: 'Disabled toggle' });
      expect(toggle).toBeDisabled();

      fireEvent.click(toggle);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Segmented', () => {
    it('renders options and fires onChange when a new option is clicked', () => {
      const onChange = vi.fn();
      render(
        <Segmented
          options={[
            { value: 'instant', label: 'Instant' },
            { value: 'off', label: 'Off' },
          ]}
          value="instant"
          onChange={onChange}
          aria-label="Mistake check"
        />,
      );

      const instantRadio = screen.getByRole('radio', { name: 'Instant' });
      const offRadio = screen.getByRole('radio', { name: 'Off' });

      expect(instantRadio).toHaveAttribute('aria-checked', 'true');
      expect(offRadio).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(offRadio);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('off');
    });

    it('does not fire onChange when the active option is clicked', () => {
      const onChange = vi.fn();
      render(
        <Segmented
          options={['light', 'dark'] as const}
          value="light"
          onChange={onChange}
        />,
      );

      const lightRadio = screen.getByRole('radio', { name: 'light' });
      fireEvent.click(lightRadio);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Tabs', () => {
    const tabsList = [
      { id: 'game', label: 'Game' },
      { id: 'play', label: 'Play' },
      { id: 'feel', label: 'Look & feel' },
    ] as const;

    it('renders tabs with correct selection', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={tabsList} activeTab="game" onChange={onChange} />);

      const gameTab = screen.getByRole('tab', { name: 'Game' });
      const playTab = screen.getByRole('tab', { name: 'Play' });

      expect(gameTab).toHaveAttribute('aria-selected', 'true');
      expect(gameTab).toHaveAttribute('tabIndex', '0');
      expect(playTab).toHaveAttribute('aria-selected', 'false');
      expect(playTab).toHaveAttribute('tabIndex', '-1');
    });

    it('handles tab click', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={tabsList} activeTab="game" onChange={onChange} />);

      fireEvent.click(screen.getByRole('tab', { name: 'Play' }));
      expect(onChange).toHaveBeenCalledWith('play');
    });

    it('supports arrow key navigation (Right, Left, Home, End)', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Tabs tabs={tabsList} activeTab="game" onChange={onChange} />,
      );

      const gameTab = screen.getByRole('tab', { name: 'Game' });
      gameTab.focus();

      // ArrowRight: goes to play
      fireEvent.keyDown(gameTab, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith('play');

      // Re-render with play active
      rerender(<Tabs tabs={tabsList} activeTab="play" onChange={onChange} />);
      const playTab = screen.getByRole('tab', { name: 'Play' });

      // ArrowLeft: goes back to game
      fireEvent.keyDown(playTab, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith('game');

      // End: goes to feel
      fireEvent.keyDown(playTab, { key: 'End' });
      expect(onChange).toHaveBeenCalledWith('feel');

      // Home: goes to game
      fireEvent.keyDown(playTab, { key: 'Home' });
      expect(onChange).toHaveBeenCalledWith('game');
    });
  });

  describe('IconButton', () => {
    it('falls back to the label for the tooltip and has no native title', () => {
      render(<IconButton icon={<GearIcon />} label="Close settings" />);
      const button = screen.getByRole('button', { name: 'Close settings' });
      expect(button).not.toHaveAttribute('title');
      fireEvent.mouseEnter(button);
      expect(screen.getByRole('tooltip')).toHaveTextContent('Close settings');
    });

    it('renders with accessible label and shows tooltip on hover only', () => {
      render(
        <IconButton
          icon={<GearIcon />}
          label="Settings"
          tooltip="Game Settings"
        />,
      );

      const button = screen.getByRole('button', { name: 'Settings' });
      expect(button).toBeInTheDocument();
      // The custom tooltip replaces the native one, so no double tooltip
      expect(button).not.toHaveAttribute('title');

      // Tooltip is not visible before hover
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Hover shows tooltip
      fireEvent.mouseEnter(button);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Game Settings');

      // Mouse leave hides tooltip
      fireEvent.mouseLeave(button);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Focus alone never opens it (modals autofocus their first button)
      fireEvent.focus(button);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Slider', () => {
    it('dispatches numeric value changes', () => {
      const onChange = vi.fn();
      render(
        <Slider
          value={50}
          min={0}
          max={100}
          onChange={onChange}
          aria-label="Volume"
        />,
      );

      const slider = screen.getByRole('slider', { name: 'Volume' });
      expect(slider).toHaveValue('50');

      fireEvent.change(slider, { target: { value: '75' } });
      expect(onChange).toHaveBeenCalledWith(75);
    });
  });

  describe('StickerButton', () => {
    it('renders and responds to click', () => {
      const onClick = vi.fn();
      render(
        <StickerButton onClick={onClick} variant="primary">
          Click Me
        </StickerButton>,
      );

      const btn = screen.getByRole('button', { name: 'Click Me' });
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders armed styling when armed is true', () => {
      render(
        <StickerButton variant="ghost" armed={true}>
          Reset
        </StickerButton>,
      );

      const btn = screen.getByRole('button', { name: 'Reset' });
      expect(btn).toHaveClass('border-error');
    });
  });

  describe('Toast', () => {
    it('renders as polite live region and handles action button', () => {
      const onAction = vi.fn();
      const onClose = vi.fn();
      render(
        <Toast
          message="Couldn't make a puzzle, try again"
          actionLabel="Retry"
          onAction={onAction}
          onClose={onClose}
        />,
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent("Couldn't make a puzzle, try again");

      const retryBtn = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(retryBtn);
      expect(onAction).toHaveBeenCalledTimes(1);

      const closeBtn = screen.getByRole('button', {
        name: 'Close notification',
      });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Otter brand mascot', () => {
    it('renders svg with aria-hidden default', () => {
      const { container } = render(<Otter size={40} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('width', '40');
    });
  });
});

import { useEffect } from 'react';
import { moveSelection } from '../game/queries';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { useViewStore } from '../store/view';
import { modalStack } from './modalStack';

export function useKeyboard(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        modalStack.pop();
        return;
      }

      if (useViewStore.getState().view !== 'game') return;

      if (
        modalStack.isOpen() ||
        document.querySelector('[data-modal-open="true"]')
      ) {
        return;
      }

      const {
        selected,
        enter,
        erase,
        toggleNotesMode,
        setPaused,
        paused,
        select,
      } = useGameStore.getState();
      const { showTimer } = useSettingsStore.getState();

      if (e.key >= '1' && e.key <= '9') {
        enter(Number(e.key));
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        erase();
        return;
      }

      const lower = e.key.toLowerCase();
      if (lower === 'n') {
        toggleNotesMode();
        return;
      }

      if (lower === 'p' && showTimer) {
        setPaused(!paused);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        select(selected === null ? 0 : moveSelection(selected, 'up'));
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        select(selected === null ? 0 : moveSelection(selected, 'down'));
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        select(selected === null ? 0 : moveSelection(selected, 'left'));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        select(selected === null ? 0 : moveSelection(selected, 'right'));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

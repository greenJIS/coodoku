import { useEffect, useRef } from 'react';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { CARD_BUTTON, CARD_CLASS, Modal } from './Modal';

export interface GameOverModalProps {
  open: boolean;
  onRetry: () => void;
  onNewGame: () => void;
}

export function GameOverModal({
  open,
  onRetry,
  onNewGame,
}: GameOverModalProps) {
  const game = useGameStore((s) => s.game);
  const originRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      originRef.current = document.querySelector('[data-testid="heart-row"]');
    }
  }, [open]);

  const elapsedMs = game?.elapsedMs ?? 0;
  const timeStr = formatTime(elapsedMs);

  return (
    <Modal
      open={open}
      onClose={() => {}} // Game over modal stays until player picks retry or new game
      closeOnBackdropClick={false}
      originRef={originRef}
      label="Game Over"
      className={CARD_CLASS}
    >
      <h2 className="mb-1.5 text-[34px] text-ink-900">Oh no, out of tries</h2>
      <p className="mb-4 text-slate-500">
        No worries, it happens. Take another go? &middot; {timeStr}
      </p>

      <div className="flex justify-center gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          className={`
            ${CARD_BUTTON}
            bg-slate-100 text-ink-900
            dark:bg-cream-200
          `}
        >
          Retry puzzle
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className={`
            ${CARD_BUTTON}
            bg-brand-500 text-brand-900
          `}
        >
          New game
        </button>
      </div>
    </Modal>
  );
}

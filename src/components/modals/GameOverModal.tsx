import { useEffect, useRef } from 'react';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { StickerButton } from '../ui';
import { Modal } from './Modal';

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
      className="text-center"
    >
      <h2 className="text-[30px] font-extrabold text-ink-900 mb-2">
        Out of hearts
      </h2>
      <p className="text-slate-500 font-bold text-[14px] mb-6">
        All 5 hearts used up &middot;{' '}
        <span className="font-extrabold text-ink-900">{timeStr}</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <StickerButton
          variant="soft"
          size="md"
          onClick={onRetry}
          className="w-full sm:w-auto"
        >
          Retry puzzle
        </StickerButton>

        <StickerButton
          variant="primary"
          size="md"
          onClick={onNewGame}
          className="w-full sm:w-auto"
        >
          New game
        </StickerButton>
      </div>
    </Modal>
  );
}

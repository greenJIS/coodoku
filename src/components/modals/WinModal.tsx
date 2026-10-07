import { useEffect, useRef } from 'react';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { StickerButton } from '../ui';
import { Modal } from './Modal';

export interface WinModalProps {
  open: boolean;
  onNewGame: () => void;
}

const CONFETTI_COLORS = [
  '#f5a524',
  '#ec176c',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#e0940f',
];

export function WinModal({ open, onNewGame }: WinModalProps) {
  const game = useGameStore((s) => s.game);
  const newBest = useGameStore((s) => s.newBest);
  const lastEntered = useGameStore((s) => s.lastEntered);

  const originRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open && lastEntered !== null) {
      originRef.current = document.querySelector(
        `[data-cell="${lastEntered}"]`,
      );
    }
  }, [open, lastEntered]);

  const elapsedMs = game?.elapsedMs ?? 0;
  const timeStr = formatTime(elapsedMs);

  return (
    <Modal
      open={open}
      onClose={() => {}} // Won game modal stays until new game
      closeOnBackdropClick={false}
      originRef={originRef}
      label="Puzzle Solved!"
      className="text-center relative overflow-hidden"
    >
      {/* Confetti particles */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
          {Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.8;
            const duration = 2 + Math.random() * 1.5;
            const bg = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            return (
              <div
                key={i}
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  backgroundColor: bg,
                }}
                className="absolute -top-3 w-2.5 h-3.5 rounded-xs animate-fall"
              />
            );
          })}
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mb-2">
        Solved!
      </h2>

      <p className="text-slate-500 font-bold text-base mb-2">
        Completed in{' '}
        <span className="font-extrabold text-ink-900">{timeStr}</span>
      </p>

      {newBest && (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500 text-brand-900 font-extrabold text-xs shadow-[0_2px_0_var(--color-brand-700)] mb-4 animate-pop">
          ★ New Best Time!
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <StickerButton
          variant="primary"
          size="lg"
          onClick={onNewGame}
          className="w-full max-w-[220px]"
        >
          New game
        </StickerButton>
      </div>
    </Modal>
  );
}

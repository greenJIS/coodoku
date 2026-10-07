import { useEffect, useRef, useState } from 'react';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { CARD_BUTTON, CARD_CLASS, Modal } from './Modal';

export interface WinModalProps {
  open: boolean;
  onNewGame: () => void;
}

const CONFETTI_COLORS = ['#f5a524', '#ec176c', '#f8cd82', '#fbcfdf', '#b45309'];
const CONFETTI_COUNT = 60;
const CONFETTI_LIFETIME_MS = 4500;

interface ConfettiBit {
  left: number;
  duration: number;
  delay: number;
  color: string;
}

function makeConfetti(): ConfettiBit[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, n) => ({
    left: Math.random() * 100,
    duration: 1.6 + Math.random() * 1.8,
    delay: Math.random() * 0.6,
    color: CONFETTI_COLORS[n % CONFETTI_COLORS.length],
  }));
}

export function WinModal({ open, onNewGame }: WinModalProps) {
  const game = useGameStore((s) => s.game);
  const newBest = useGameStore((s) => s.newBest);
  const lastEntered = useGameStore((s) => s.lastEntered);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const originRef = useRef<HTMLElement | null>(null);
  const [confetti, setConfetti] = useState<ConfettiBit[]>([]);

  useEffect(() => {
    if (open) {
      originRef.current = document.querySelector(
        lastEntered !== null
          ? `[data-cell="${lastEntered}"]`
          : '[data-testid="sudoku-board"]',
      );
    }
  }, [open, lastEntered]);

  // Confetti only on a win, gone after it has fallen
  useEffect(() => {
    if (!open || reduceMotion) {
      setConfetti([]);
      return;
    }
    setConfetti(makeConfetti());
    const timer = setTimeout(() => setConfetti([]), CONFETTI_LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [open, reduceMotion]);

  const timeStr = formatTime(game?.elapsedMs ?? 0);
  const message = `${game?.name ?? ''} \u00b7 ${timeStr}${newBest ? ' \u00b7 New best!' : ''}`;

  return (
    <Modal
      open={open}
      onClose={() => {}} // Won game modal stays until new game
      closeOnBackdropClick={false}
      originRef={originRef}
      label="Puzzle Solved!"
      className={CARD_CLASS}
    >
      {confetti.length > 0 && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
        >
          {confetti.map((bit, i) => (
            <div
              key={i}
              style={{
                left: `${bit.left}vw`,
                animationDelay: `${bit.delay}s`,
                animationDuration: `${bit.duration}s`,
                backgroundColor: bit.color,
              }}
              className="absolute -top-3 w-[9px] h-[14px] animate-fall"
            />
          ))}
        </div>
      )}

      <h2 className="text-[28px] font-bold text-ink-900 mb-1.5">
        Nicely done!
      </h2>
      <p className="text-slate-500 font-semibold mb-4">{message}</p>

      <button
        type="button"
        onClick={onNewGame}
        className={`${CARD_BUTTON} bg-brand-500 text-brand-900`}
      >
        New game
      </button>
    </Modal>
  );
}

import { formatTime } from '../lib/time';
import { useGameStore } from '../store/game';

export interface TimerProps {
  elapsedMs?: number;
  className?: string;
}

export function Timer({ elapsedMs: explicitMs, className = '' }: TimerProps) {
  const storeElapsedMs = useGameStore((s) => s.game?.elapsedMs ?? 0);
  const ms = explicitMs ?? storeElapsedMs;
  const formatted = formatTime(ms);

  return (
    <span
      role="timer"
      aria-label={`Elapsed time ${formatted}`}
      data-testid="game-timer"
      className={`font-hand text-3xl sm:text-4xl text-ink-900 tabular-nums select-none ${className}`}
    >
      {formatted}
    </span>
  );
}

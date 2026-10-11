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
      className={`
        inline-grid justify-items-end font-hand text-[40px] leading-[normal]
        font-normal tracking-[0.01em] text-ink-900 tabular-nums select-none
        max-[860px]:text-[28px] max-[420px]:text-[24px] max-[359px]:text-[20px]
        ${className}
      `}
    >
      {/* Sizer reserves the widest reading (H:MM:SS) so neighbors never shift */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        00:00:00
      </span>
      <span className="col-start-1 row-start-1">{formatted}</span>
    </span>
  );
}

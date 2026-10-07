import { remainingCount } from '../game/queries';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';

const NOTES_RING = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='46' fill='none' stroke='%23e0940f' stroke-width='2.6' stroke-dasharray='9 5.45' stroke-linecap='round'/%3E%3C/svg%3E")`;

export interface NumberPadProps {
  className?: string;
}

export function NumberPad({ className = '' }: NumberPadProps) {
  const game = useGameStore((s) => s.game);
  const notesMode = useGameStore((s) => s.notesMode);
  const generating = useGameStore((s) => s.generating);
  const enter = useGameStore((s) => s.enter);

  const showRemaining = useSettingsStore((s) => s.showRemaining);

  return (
    <div
      role="group"
      aria-label="Number pad"
      className={`grid grid-cols-3 gap-x-3 gap-y-2.5 min-[861px]:gap-x-[18px] min-[861px]:gap-y-3.5 w-full ${className}`}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
        const count = game ? remainingCount(game, digit) : 9;
        const isDone = showRemaining && count <= 0;
        const isDisabled = generating || isDone;

        return (
          <button
            key={digit}
            type="button"
            data-digit={digit}
            aria-label={
              showRemaining
                ? `Digit ${digit}, ${count} remaining`
                : `Digit ${digit}`
            }
            disabled={isDisabled}
            onClick={() => enter(digit)}
            className={`relative aspect-square rounded-full border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-hand text-[34px] leading-[normal] select-none narrow:w-16 narrow:justify-self-center cursor-pointer
              shadow-[0_4px_0_var(--color-edge)] transition-[transform,box-shadow] duration-[90ms]
              hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)]
              active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]
              focus-visible:outline-3 focus-visible:outline-brand-400 focus-visible:outline-offset-2
              ${
                isDone
                  ? 'opacity-30 pointer-events-none cursor-not-allowed'
                  : ''
              }
              ${generating ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {/* Dotted ring, scales in when notes mode turns on */}
            <span
              aria-hidden="true"
              data-notes-ring={notesMode ? 'on' : 'off'}
              className={`absolute inset-1 rounded-full pointer-events-none bg-center bg-no-repeat bg-size-[100%_100%] [transition:opacity_.2s,transform_.25s_cubic-bezier(.3,1.5,.5,1)] ${
                notesMode ? 'opacity-100 scale-100' : 'opacity-0 scale-[.85]'
              }`}
              style={{ backgroundImage: NOTES_RING }}
            />

            <span>{digit}</span>

            {/* Remaining count badge */}
            {showRemaining && (
              <span
                aria-hidden="true"
                className="absolute right-2.5 bottom-2 font-sans font-bold text-[11px] text-slate-500"
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

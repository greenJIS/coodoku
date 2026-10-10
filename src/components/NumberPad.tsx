import { remainingCount } from '../game/queries';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { EraseButton } from './EraseButton';

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
      className={`
        grid w-full grid-cols-[repeat(3,1fr)] gap-x-3 gap-y-2.5
        min-[861px]:gap-x-4.5 min-[861px]:gap-y-3.5
        compact:grid-cols-5 compact:gap-2
        ${className}
      `}
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
            className={`
              relative aspect-square cursor-pointer rounded-full border-2
              border-edge bg-cream-50 px-1.5 py-px font-hand text-[34px]
              leading-[normal] text-ink-900 shadow-[0_4px_0_var(--color-edge)]
              transition-[transform,box-shadow] duration-90 select-none
              hover:border-brand-600
              hover:shadow-[0_4px_0_var(--color-brand-600)]
              focus-visible:outline-3 focus-visible:outline-offset-2
              focus-visible:outline-brand-400
              active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-edge)]
              dark:bg-cream-100
              tight:w-16 tight:justify-self-center
              compact:h-11 compact:w-auto compact:justify-self-stretch compact:aspect-auto compact:text-[24px]
              ${
                isDone
                  ? 'pointer-events-none cursor-not-allowed opacity-30'
                  : ''
              }
              ${generating ? 'cursor-not-allowed opacity-40' : ''}
            `}
          >
            {/* Dotted ring, scales in when notes mode turns on */}
            <span
              aria-hidden="true"
              data-notes-ring={notesMode ? 'on' : 'off'}
              className={`
                pointer-events-none absolute inset-1 rounded-full
                bg-size-[100%_100%] bg-center bg-no-repeat
                [transition:opacity_.2s,transform_.25s_cubic-bezier(.3,1.5,.5,1)]
                ${notesMode ? 'scale-100 opacity-100' : 'scale-[.85] opacity-0'}
              `}
              style={{ backgroundImage: NOTES_RING }}
            />

            <span>{digit}</span>

            {/* Remaining count badge */}
            {showRemaining && (
              <span
                aria-hidden="true"
                className="
                  absolute right-2.5 bottom-2 font-sans text-[11px]
                  text-slate-500
                  compact:right-1.5 compact:bottom-0.5 compact:text-[9px]
                "
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      <EraseButton variant="pad" className="hidden compact:flex" />
    </div>
  );
}

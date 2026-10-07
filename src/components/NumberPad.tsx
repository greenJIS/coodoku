import { remainingCount } from '../game/queries';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';

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
      className={`grid grid-cols-3 gap-3.5 sm:gap-4 w-full ${className}`}
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
            className={`relative aspect-square rounded-full border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-hand text-3xl sm:text-4xl select-none cursor-pointer
              shadow-[0_4px_0_var(--color-edge)] transition-[transform,box-shadow,border-color,opacity] duration-100
              hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)]
              active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]
              focus-visible:outline-3 focus-visible:outline-brand-400 focus-visible:outline-offset-2
              ${
                isDone
                  ? 'opacity-30 pointer-events-none cursor-not-allowed shadow-none'
                  : ''
              }
              ${generating ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {/* Dotted ring in notes mode */}
            {notesMode && (
              <span
                aria-hidden="true"
                className="absolute inset-1 rounded-full border-2 border-dashed border-brand-500 pointer-events-none animate-[pop_0.2s_ease-out]"
              />
            )}

            <span className="leading-none">{digit}</span>

            {/* Remaining count badge */}
            {showRemaining && (
              <span
                aria-hidden="true"
                className="absolute right-2 sm:right-2.5 bottom-1.5 sm:bottom-2 font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-500"
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

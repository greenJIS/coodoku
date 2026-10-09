import type { Difficulty } from '../../engine';
import { formatTime } from '../../lib/time';
import { useStatsStore } from '../../store/stats';
import { StickerButton } from '../ui';
import { LIFT, LIFT_MOVE } from './lift';

/* eslint-disable-next-line react-refresh/only-export-components */
export const DIFFICULTY_ORDER: readonly Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'expert',
];

function label(d: Difficulty): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export interface DifficultyPickerProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  /** When set, a Start button is rendered under the tiles. */
  onStart?: () => void;
  /** Start button is waiting for its confirming second tap. */
  armed?: boolean;
}

export function DifficultyPicker({
  value,
  onChange,
  onStart,
  armed = false,
}: DifficultyPickerProps) {
  const stats = useStatsStore((s) => s.stats);

  return (
    <div>
      <div
        className="
          mb-1.5 text-[16px] tracking-[0.08em] text-slate-500 uppercase
        "
      >
        New game
      </div>
      <div className="grid grid-cols-4 gap-2">
        {DIFFICULTY_ORDER.map((d, i) => {
          const entry = stats[d];
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(d)}
              className={`
                rounded-[14px] border-2 px-1 py-2 text-center
                ${
                  selected
                    ? `
                      ${LIFT_MOVE}
                      border-brand-700 bg-sel
                      shadow-[0_3px_0_var(--color-brand-700)]
                      not-disabled:not-aria-disabled:hover:shadow-[0_5px_0_var(--color-brand-700)]
                    `
                    : `
                      ${LIFT}
                      border-edge bg-cream-50 shadow-[0_3px_0_var(--color-edge)]
                      dark:bg-cream-100
                    `
                }
              `}
            >
              <strong className="block text-[22px] leading-tight font-normal">
                {label(d)}
              </strong>
              <span
                aria-hidden="true"
                className="my-1 flex justify-center gap-0.75"
              >
                {DIFFICULTY_ORDER.map((_, dot) => (
                  <i
                    key={dot}
                    className={`
                      size-1.75 rounded-full
                      ${dot <= i ? 'bg-brand-500' : 'bg-slate-300'}
                    `}
                  />
                ))}
              </span>
              <span className="block text-[16px] leading-snug text-slate-500">
                {entry?.solved ?? 0} solved
              </span>
              <span className="block text-[16px] leading-snug text-slate-500">
                best {entry?.bestMs == null ? '—' : formatTime(entry.bestMs)}
              </span>
            </button>
          );
        })}
      </div>
      {onStart && (
        <StickerButton
          variant="soft"
          armed={armed}
          onClick={onStart}
          className={`
            ${LIFT_MOVE}
            mt-3 w-full text-[20px]
          `}
        >
          {armed
            ? 'Tap again to replace your saved game'
            : `Start ${label(value)} game`}
        </StickerButton>
      )}
    </div>
  );
}

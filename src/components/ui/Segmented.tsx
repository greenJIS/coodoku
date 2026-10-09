import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
  'aria-label'?: string;
}

export interface SegmentedProps<T extends string | number> {
  options: readonly (SegmentedOption<T> | T)[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  className?: string;
  'aria-label'?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  const normalizedOptions: SegmentedOption<T>[] = options.map((opt) =>
    typeof opt === 'object' && opt !== null && 'value' in opt
      ? (opt as SegmentedOption<T>)
      : { value: opt as T, label: String(opt) },
  );

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`
        inline-flex shrink-0 items-center overflow-hidden rounded-full border-2
        border-edge
        ${className}
      `}
    >
      {normalizedOptions.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={opt['aria-label']}
            onClick={() => {
              if (opt.value !== value) {
                onChange(opt.value);
              }
            }}
            className={`
              cursor-pointer px-3 py-1.25 text-[16px] select-none
              focus-visible:outline-2 focus-visible:-outline-offset-2
              focus-visible:outline-brand-400
              ${
                isSelected
                  ? 'bg-brand-500 text-brand-900 shadow-none'
                  : `
                    bg-transparent text-slate-500
                    hover:text-ink-900
                  `
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

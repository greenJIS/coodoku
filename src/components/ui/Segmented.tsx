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
      className={`inline-flex items-center shrink-0 border-2 border-edge rounded-full overflow-hidden ${className}`}
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
            className={`px-3 py-[5px] text-[13px] font-bold select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-[-2px] ${
              isSelected
                ? 'bg-brand-500 text-brand-900 shadow-none'
                : 'text-slate-500 hover:text-ink-900 bg-transparent'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

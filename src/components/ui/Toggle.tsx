import type { ChangeEvent } from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  className = '',
}: ToggleProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(e.target.checked);
  };

  return (
    <input
      type="checkbox"
      role="switch"
      id={id}
      name={name}
      aria-label={ariaLabel}
      aria-checked={checked}
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      className={`
        relative inline-block h-7 w-11.5 shrink-0 cursor-pointer
        appearance-none rounded-full border-2 outline-none
        [transition:background_.18s,border-color_.18s]
        ${checked ? 'border-brand-700 bg-brand-500' : 'border-edge bg-hairline'}
        after:absolute after:top-px after:left-px after:box-border
        after:size-5 after:rounded-full after:content-['']
        after:[transition:transform_.2s_cubic-bezier(.4,1.4,.5,1),border-color_.18s,box-shadow_.18s]
        ${
          checked
            ? `
              after:translate-x-4.5 after:border-2 after:border-brand-700
              after:bg-white after:shadow-[0_2px_0_var(--color-brand-700)]
              dark:after:bg-[#fff7e6]
            `
            : `
              after:translate-x-0 after:border-2 after:border-edge
              after:bg-white after:shadow-[0_2px_0_var(--color-edge)]
              dark:after:bg-[#4a3c25]
            `
        }
        focus-visible:outline-3 focus-visible:outline-offset-2
        focus-visible:outline-brand-300
        disabled:cursor-not-allowed disabled:opacity-40
        ${className}
      `}
    />
  );
}

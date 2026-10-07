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
      className={`relative inline-block w-[46px] h-[28px] shrink-0 appearance-none rounded-full cursor-pointer transition-[background-color,border-color] duration-200 outline-none
        border-2 ${
          checked ? 'bg-brand-500 border-brand-700' : 'bg-hairline border-edge'
        }
        after:content-[''] after:box-border after:absolute after:top-[1px] after:left-[1px] after:w-[20px] after:h-[20px] after:rounded-full after:transition-[transform,border-color,box-shadow,background-color] after:duration-200
        ${
          checked
            ? 'after:translate-x-[18px] after:bg-white dark:after:bg-[#fff7e6] after:border-2 after:border-brand-700 after:shadow-[0_2px_0_var(--color-brand-700)]'
            : 'after:translate-x-0 after:bg-white dark:after:bg-[#4a3c25] after:border-2 after:border-edge after:shadow-[0_2px_0_var(--color-edge)]'
        }
        focus-visible:outline-3 focus-visible:outline-brand-300 focus-visible:outline-offset-2
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    />
  );
}

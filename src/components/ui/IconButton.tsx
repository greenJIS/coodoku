import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'close';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      label,
      tooltip,
      size = 'md',
      variant = 'default',
      className = '',
      disabled,
      ...rest
    },
    ref,
  ) {
    const sizeClasses = {
      sm: 'w-9.5 h-9.5 text-[22px] shadow-[0_3px_0_var(--color-edge)] active:translate-y-0.5 active:shadow-[0_1px_0_var(--color-edge)]',
      md: 'w-12 h-12 text-[26px] shadow-[0_4px_0_var(--color-edge)] active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-edge)]',
      lg: 'w-13.5 h-13.5 text-[29px] shadow-[0_4px_0_var(--color-edge)] active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-edge)]',
    }[size];

    let variantClasses =
      'bg-cream-50 dark:bg-cream-100 text-[#b45309] border-2 border-edge hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)]';

    if (variant === 'accent') {
      variantClasses =
        'bg-brand-500 text-brand-900 border-2 border-brand-700 shadow-[0_4px_0_var(--color-brand-700)] hover:border-brand-800 hover:shadow-[0_4px_0_var(--color-brand-800)] active:shadow-[0_1px_0_var(--color-brand-700)]';
    } else if (variant === 'close') {
      variantClasses =
        'bg-cream-50 dark:bg-[#3a2f1e] text-[#b45309] border-2 border-edge hover:border-brand-600 hover:text-brand-600 shadow-[0_3px_0_var(--color-edge)] active:translate-y-0.5 active:shadow-[0_1px_0_var(--color-edge)]';
    }

    return (
      <Tooltip
        text={tooltip ?? label}
        align={variant === 'close' ? 'end' : 'center'}
      >
        <button
          ref={ref}
          type="button"
          aria-label={label}
          disabled={disabled}
          className={`
            relative grid cursor-pointer place-items-center rounded-full
            select-none
            ${
              variant === 'close'
                ? `
                  [transition:transform_.08s,box-shadow_.08s,border-color_.15s,color_.15s]
                `
                : 'transition-transform duration-100'
            }
            focus-visible:outline-3 focus-visible:outline-offset-2
            focus-visible:outline-brand-300
            disabled:pointer-events-none disabled:transform-none
            disabled:cursor-not-allowed disabled:opacity-40
            ${sizeClasses}
            ${variantClasses}
            ${className}
          `}
          {...rest}
        >
          {icon}
        </button>
      </Tooltip>
    );
  },
);

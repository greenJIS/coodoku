import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
  useState,
} from 'react';

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
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const sizeClasses = {
      sm: 'w-[38px] h-[38px] text-[18px] shadow-[0_3px_0_var(--color-edge)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-edge)]',
      md: 'w-[48px] h-[48px] text-[22px] shadow-[0_4px_0_var(--color-edge)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]',
      lg: 'w-[54px] h-[54px] text-[24px] shadow-[0_4px_0_var(--color-edge)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]',
    }[size];

    let variantClasses =
      'bg-cream-50 dark:bg-cream-100 text-brand-700 dark:text-brand-400 border-2 border-edge hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)]';

    if (variant === 'accent') {
      variantClasses =
        'bg-brand-500 text-brand-900 border-2 border-brand-700 shadow-[0_4px_0_var(--color-brand-700)] hover:border-brand-800 hover:shadow-[0_4px_0_var(--color-brand-800)] active:shadow-[0_1px_0_var(--color-brand-700)]';
    } else if (variant === 'close') {
      variantClasses =
        'bg-cream-50 dark:bg-cream-100 text-brand-700 border-2 border-edge hover:border-brand-600 hover:text-brand-600 shadow-[0_3px_0_var(--color-edge)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-edge)]';
    }

    const tooltipText = tooltip ?? label;
    const showTooltip = Boolean(tooltip && (isHovered || isFocused));

    return (
      <div className="relative inline-flex items-center justify-center">
        <button
          ref={ref}
          type="button"
          aria-label={label}
          title={tooltipText}
          disabled={disabled}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`relative rounded-full grid place-items-center select-none cursor-pointer transition-[transform,box-shadow,border-color,background-color] duration-100 focus-visible:outline-3 focus-visible:outline-brand-300 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none ${sizeClasses} ${variantClasses} ${className}`}
          {...rest}
        >
          {icon}
        </button>

        {showTooltip && (
          <span
            role="tooltip"
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-bold rounded-md bg-ink-900 text-cream-50 whitespace-nowrap shadow-md pointer-events-none z-50 animate-pop"
          >
            {tooltipText}
          </span>
        )}
      </div>
    );
  },
);

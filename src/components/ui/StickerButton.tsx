import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface StickerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'soft' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  armed?: boolean;
  children: ReactNode;
}

export function StickerButton({
  variant = 'default',
  size = 'md',
  armed = false,
  className = '',
  disabled,
  children,
  ...rest
}: StickerButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-[14px] rounded-xl',
    md: 'px-4 py-2 text-[17px] rounded-2xl',
    lg: 'px-6 py-2.5 text-[19px] rounded-full',
  }[size];

  let variantClasses: string;
  if (variant === 'primary') {
    variantClasses =
      'bg-brand-500 text-brand-900 border-2 border-brand-700 shadow-[0_4px_0_var(--color-brand-700)] hover:border-brand-800 hover:shadow-[0_4px_0_var(--color-brand-800)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-brand-700)]';
  } else if (variant === 'soft') {
    variantClasses = armed
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-2 border-error shadow-[0_4px_0_var(--color-error)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-error)]'
      : 'bg-slate-100 dark:bg-cream-200 text-ink-900 border-2 border-edge shadow-[0_4px_0_var(--color-edge)] hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]';
  } else if (variant === 'ghost') {
    variantClasses = armed
      ? 'bg-transparent text-error border-2 border-error shadow-[0_4px_0_var(--color-error)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-error)]'
      : 'bg-transparent text-slate-500 border-2 border-edge shadow-[0_4px_0_var(--color-edge)] hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]';
  } else if (variant === 'danger') {
    variantClasses =
      'bg-rose-50 text-error border-2 border-error shadow-[0_4px_0_var(--color-error)] hover:bg-rose-100 active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-error)]';
  } else {
    // default
    variantClasses = armed
      ? 'bg-cream-50 text-error border-2 border-error shadow-[0_4px_0_var(--color-error)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-error)]'
      : 'bg-cream-50 dark:bg-cream-100 text-ink-900 border-2 border-edge shadow-[0_4px_0_var(--color-edge)] hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)]';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center select-none cursor-pointer transition-[transform,box-shadow,border-color,background-color] duration-100 focus-visible:outline-3 focus-visible:outline-brand-300 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

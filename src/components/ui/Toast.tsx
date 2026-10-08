import type { ReactNode } from 'react';
import { CloseIcon } from '../icons';

export interface ToastProps {
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  message,
  actionLabel,
  onAction,
  onClose,
  className = '',
}: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-cream-50 dark:bg-cream-100 text-ink-900 border-2 border-edge shadow-[0_6px_0_var(--color-edge)] animate-pop max-w-[90vw] text-[17px] ${className}`}
    >
      <span className="flex-1 text-center sm:text-left">{message}</span>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-3 py-1 text-[14px] rounded-xl bg-brand-500 text-brand-900 border-2 border-brand-700 shadow-[0_2px_0_var(--color-brand-700)] hover:bg-brand-400 active:translate-y-[1px] active:shadow-none cursor-pointer"
        >
          {actionLabel}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="text-slate-500 hover:text-ink-900 p-0.5 rounded-full cursor-pointer"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}

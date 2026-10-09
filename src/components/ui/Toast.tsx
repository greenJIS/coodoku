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
      className={`
        fixed bottom-6 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2
        animate-pop items-center gap-3 rounded-2xl border-2 border-edge
        bg-cream-50 px-4 py-3 text-[17px] text-ink-900
        shadow-[0_6px_0_var(--color-edge)]
        dark:bg-cream-100
        ${className}
      `}
    >
      <span
        className="
          flex-1 text-center
          sm:text-left
        "
      >
        {message}
      </span>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="
            cursor-pointer rounded-xl border-2 border-brand-700 bg-brand-500
            px-3 py-1 text-[14px] text-brand-900
            shadow-[0_2px_0_var(--color-brand-700)]
            hover:bg-brand-400
            active:translate-y-px active:shadow-none
          "
        >
          {actionLabel}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="
            cursor-pointer rounded-full p-0.5 text-slate-500
            hover:text-ink-900
          "
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}

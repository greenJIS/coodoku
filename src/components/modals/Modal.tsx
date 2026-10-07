import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { modalStack } from '../../hooks/modalStack';
import { useGameStore } from '../../store/game';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  originRef?: RefObject<HTMLElement | null>;
  label: string;
  className?: string;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  originRef,
  label,
  className = '',
  children,
  closeOnBackdropClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Setup modal stack, pause coordination, focus management, and origin transform
  useEffect(() => {
    if (!open) return;

    // Capture the trigger or currently focused element to restore on close
    triggerElementRef.current =
      originRef?.current ?? (document.activeElement as HTMLElement | null);

    // Register onto modalStack
    const unregister = modalStack.push(onClose);

    // Opening first modal pauses the game
    if (modalStack.count() === 1) {
      useGameStore.getState().setPaused(true);
    }

    // Scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Measure trigger rect to set --tx, --ty, --s
    const dialogEl = dialogRef.current;
    if (dialogEl) {
      const triggerEl = triggerElementRef.current;
      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        const triggerCenterX = rect.left + rect.width / 2;
        const triggerCenterY = rect.top + rect.height / 2;
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const tx = triggerCenterX - screenCenterX;
        const ty = triggerCenterY - screenCenterY;
        const s = Math.min(rect.width / 380, 0.25) || 0.12;

        dialogEl.style.setProperty('--tx', `${tx}px`);
        dialogEl.style.setProperty('--ty', `${ty}px`);
        dialogEl.style.setProperty('--s', String(s));
      } else {
        dialogEl.style.setProperty('--tx', '0px');
        dialogEl.style.setProperty('--ty', '0px');
        dialogEl.style.setProperty('--s', '0.12');
      }

      // Initial focus inside dialog
      const focusables =
        dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        dialogEl.focus();
      }
    }

    return () => {
      unregister();
      document.body.style.overflow = prevOverflow;

      // Closing the last modal unpauses the game
      if (modalStack.count() === 0) {
        useGameStore.getState().setPaused(false);
      }

      // Restore focus to trigger
      triggerElementRef.current?.focus();
    };
  }, [open, onClose, originRef]);

  // Trap focus within the dialog
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      // Delegate to top of stack
      if (modalStack.isOpen()) {
        modalStack.pop();
      } else {
        onClose();
      }
      return;
    }

    if (e.key === 'Tab') {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true',
      );

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (
          document.activeElement === firstElement ||
          document.activeElement === dialog
        ) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      data-testid="modal-backdrop"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-[4px] animate-fade-in"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-[24px] border-2 border-edge bg-cream-50 dark:bg-cream-100 p-6 text-ink-900 shadow-[0_12px_32px_rgba(28,27,26,0.35)] outline-none animate-[modalIn_0.3s_cubic-bezier(0.2,0.9,0.3,1.08)_both] ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

import type { IconProps } from './types';

export function HomeIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function GearIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

export function PauseIcon({
  size = 22,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect
        x="6.5"
        y="5"
        width="4"
        height="14"
        rx="1.4"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="13.5"
        y="5"
        width="4"
        height="14"
        rx="1.4"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function PlayIcon({
  size = 22,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <polygon points="7 4 20 12 7 20" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UndoIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

export function EraseIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M20 20H9L4 15l9-9 7 7-6 7" />
    </svg>
  );
}

export function HintIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </svg>
  );
}

export interface HeartIconProps extends IconProps {
  filled?: boolean;
}

export function HeartIcon({
  size = 22,
  strokeWidth = 2,
  filled = true,
  className,
  'aria-hidden': ariaHidden = true,
}: HeartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M12 21s-7-4.6-9.3-9.2C1.2 8.6 3 5 6.4 5c2 0 3.4 1.1 5.6 3.2C14.2 6.1 15.6 5 17.6 5 21 5 22.8 8.6 21.3 11.8 19 16.4 12 21 12 21z" />
    </svg>
  );
}

export function HelpIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CloseIcon({
  size = 16,
  strokeWidth = 3,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function DiceIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

export function PencilIcon({
  size = 22,
  strokeWidth = 2,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M4 20l4-1 11-11-3-3L5 16z" />
    </svg>
  );
}

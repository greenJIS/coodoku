import { type ReactNode, useState } from 'react';

export interface TooltipProps {
  text: string;
  /** `end` right-aligns the bubble so it stays inside a modal's edge. */
  align?: 'center' | 'end';
  children: ReactNode;
}

/** Custom hover-only tooltip (focus alone never opens it). Use instead of the native `title` attribute. */
export function Tooltip({ text, align = 'center', children }: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {isHovered && (
        <span
          role="tooltip"
          className={`
            pointer-events-none absolute -bottom-8 z-50 animate-pop rounded-md
            bg-ink-900 px-2 py-0.5 text-[14px] whitespace-nowrap text-cream-50
            shadow-md
            ${align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
          `}
        >
          {text}
        </span>
      )}
    </div>
  );
}
